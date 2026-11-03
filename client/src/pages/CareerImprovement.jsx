import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';

export const CareerImprovement = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'high', 'medium', 'low'

  const navigate = useNavigate();

  const loadImprovementPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/analyses/latest');
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to load improvements:', err);
      setError(err.message || 'Failed to retrieve improvement recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImprovementPlan();
  }, []);

  if (loading) {
    return <Loader message="Generating career improvement roadmap..." />;
  }

  if (error) {
    return <ErrorMessage message={error} retryAction={loadImprovementPlan} />;
  }

  const suggestions = analysis?.result?.improvement_suggestions || [];

  if (suggestions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Career Improvement Plan"
          description="Actionable steps to elevate your resume impact."
        />
        <EmptyState
          icon={TrendingUp}
          title="No Improvement Suggestions Yet"
          description="Upload your resume to receive a personalized, prioritized improvement roadmap."
          actionLabel="Upload Resume"
          onAction={() => navigate('/upload')}
        />
      </div>
    );
  }

  const filteredSuggestions = suggestions.filter((item) => {
    if (filter === 'all') return true;
    return item.priority?.toLowerCase() === filter;
  });

  const getPriorityBadge = (priority) => {
    const p = String(priority).toLowerCase();
    if (p === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
          <AlertOctagon className="w-3 h-3" /> High Priority
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
          <AlertTriangle className="w-3 h-3" /> Medium Priority
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
        <Info className="w-3 h-3" /> Low Priority
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Career Improvement Plan"
        description="Prioritized actionable enhancements to elevate your ATS score and interview conversion rate."
        action={
          <Button variant="secondary" icon={Upload} onClick={() => navigate('/upload')}>
            Upload Updated Resume
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['all', 'high', 'medium', 'low'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab} ({tab === 'all' ? suggestions.length : suggestions.filter((s) => s.priority?.toLowerCase() === tab).length})
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions.map((item, idx) => (
          <Card key={idx} className="p-6 transition-all hover:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  {getPriorityBadge(item.priority)}
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {item.area}
                  </span>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed pt-1">
                  {item.suggestion}
                </p>
              </div>

              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Action Item #{idx + 1}
                </span>
              </div>
            </div>
          </Card>
        ))}

        {filteredSuggestions.length === 0 && (
          <EmptyState
            title="No Items in this Category"
            description="All suggestions in this category are satisfied or clear."
          />
        )}
      </div>
    </div>
  );
};
