import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Upload,
  GitCompare,
  TrendingUp,
  FileText,
  Briefcase,
  Calendar,
  ArrowRight,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScoreRing } from '../components/ui/ScoreRing';
import { Loader } from '../components/ui/Loader';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { SkillBadge } from '../components/ui/SkillBadge';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [totalResumes, setTotalResumes] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [latest, resumes, matches] = await Promise.all([
        api.get('/analyses/latest'),
        api.get('/resumes'),
        api.get('/matches'),
      ]);

      setLatestAnalysis(latest);
      setTotalResumes(resumes?.length || 0);
      setTotalMatches(matches?.length || 0);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Could not load your dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Fetching your career insights..." />;
  }

  if (error) {
    return <ErrorMessage message={error} retryAction={fetchDashboardData} className="mt-4" />;
  }

  if (!latestAnalysis) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Welcome, ${user?.fullName || user?.user_metadata?.full_name || 'Job Seeker'}!`}
          description="Ready to accelerate your job search? Upload your resume to start."
        />
        <EmptyState
          icon={Upload}
          title="No Resume Uploaded Yet"
          description="Upload your PDF resume to receive instant Gemini AI scoring, skill extraction, and personalized career recommendations."
          actionLabel="Upload Your Resume"
          onAction={() => navigate('/upload')}
        />
      </div>
    );
  }

  const { result, resumes: resumeMeta, created_at } = latestAnalysis;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.fullName || user?.user_metadata?.full_name || 'Job Seeker'}`}
        description="Here is your latest resume performance and career overview."
        action={
          <Link to="/upload">
            <Button variant="primary" icon={Upload}>
              Upload New Resume
            </Button>
          </Link>
        }
      />

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <ScoreRing score={result?.resume_score || 0} size={110} strokeWidth={9} label="Resume Score" />
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Experience</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">{result?.experience_level || 'Mid-Level'}</p>
            <p className="text-xs text-slate-400 mt-1">{result?.years_of_experience || '3+'} years detected</p>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Resumes Uploaded</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">{totalResumes}</p>
            <p className="text-xs text-slate-400 mt-1">Saved versions</p>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Job Matches Evaluated</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">{totalMatches}</p>
            <p className="text-xs text-slate-400 mt-1">Target comparisons</p>
          </div>
        </Card>
      </div>

      {/* Latest Analysis Summary Banner */}
      <Card className="p-6 sm:p-8 border-l-4 border-l-indigo-600">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Analyzed on {new Date(created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span className="font-medium text-slate-600">{resumeMeta?.file_name}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Executive Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{result?.summary}</p>

            <div className="pt-2">
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                Top Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(result?.technical_skills || []).slice(0, 6).map((skill, idx) => (
                  <SkillBadge key={idx} name={skill} variant="blue" size="sm" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 flex-shrink-0">
            <Link to="/analysis">
              <Button variant="primary" icon={ArrowRight} className="w-full">
                View Detailed Report
              </Button>
            </Link>
            <Link to="/job-matching">
              <Button variant="secondary" icon={GitCompare} className="w-full">
                Compare with a Job
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/recommendations" className="block group">
          <Card className="p-6 h-full hover" hover>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Recommended Roles</h4>
            <p className="text-xs text-slate-500 mt-1">
              Explore job titles with high fit percentages derived from your resume skills.
            </p>
          </Card>
        </Link>

        <Link to="/job-matching" className="block group">
          <Card className="p-6 h-full hover" hover>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <GitCompare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Job Description Matcher</h4>
            <p className="text-xs text-slate-500 mt-1">
              Paste job descriptions to identify missing keywords and qualification gaps.
            </p>
          </Card>
        </Link>

        <Link to="/improvement" className="block group">
          <Card className="p-6 h-full hover" hover>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Improvement Roadmap</h4>
            <p className="text-xs text-slate-500 mt-1">
              Prioritized recommendations to boost your resume score and interview callbacks.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
};
