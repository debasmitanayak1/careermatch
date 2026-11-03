import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  FileText,
  GitCompare,
  Trash2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';

export const History = () => {
  const [activeTab, setActiveTab] = useState('analyses'); // 'analyses' | 'matches'
  const [analyses, setAnalyses] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analysesData, matchesData] = await Promise.all([
        api.get('/analyses'),
        api.get('/matches'),
      ]);
      setAnalyses(analysesData || []);
      setMatches(matchesData || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err.message || 'Failed to retrieve your history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteAnalysis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis? The saved resume file will also be removed.')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/analyses/${id}`);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job match evaluation?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/matches/${id}`);
      setMatches((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Loader message="Fetching historical records..." />;
  }

  if (error) {
    return <ErrorMessage message={error} retryAction={fetchHistory} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="History & Past Results"
        description="Review and manage your previous resume scans and job comparison reports."
      />

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('analyses')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'analyses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume Analyses ({analyses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'matches'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Job Matches ({matches.length})</span>
        </button>
      </div>

      {/* Tab 1: Analyses */}
      {activeTab === 'analyses' && (
        <div className="space-y-4">
          {analyses.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Resume Analyses Found"
              description="Upload your first resume to see it stored here in your history."
              actionLabel="Upload Resume"
              onAction={() => navigate('/upload')}
            />
          ) : (
            analyses.map((item) => (
              <Card key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.resumes?.file_name || 'Resume Document'}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-600">
                        Score: {item.result?.resume_score || 'N/A'}%
                      </span>
                      <span>•</span>
                      <span>Level: {item.result?.experience_level || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => navigate('/analysis')}
                  >
                    View Report
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    loading={deletingId === item.id}
                    onClick={() => handleDeleteAnalysis(item.id)}
                    aria-label="Delete analysis"
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Job Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <EmptyState
              icon={GitCompare}
              title="No Job Matches Found"
              description="Compare your resume against a target job posting to record match evaluations."
              actionLabel="Compare With Job"
              onAction={() => navigate('/job-matching')}
            />
          ) : (
            matches.map((item) => (
              <Card key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                    <GitCompare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.job_title || 'Target Job Position'}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="font-semibold text-indigo-600">
                        Compatibility: {item.result?.match_score || 0}%
                      </span>
                      <span>•</span>
                      <span>Resume: {item.resumes?.file_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    loading={deletingId === item.id}
                    onClick={() => handleDeleteMatch(item.id)}
                    aria-label="Delete match"
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
