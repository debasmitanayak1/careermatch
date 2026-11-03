import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, Upload, Sparkles } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';

const BAR_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

export const JobRecommendations = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/analyses/latest');
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError(err.message || 'Failed to load role recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  if (loading) {
    return <Loader message="Analyzing best-fitting career roles..." />;
  }

  if (error) {
    return <ErrorMessage message={error} retryAction={loadRecommendations} />;
  }

  const roles = analysis?.result?.recommended_roles || [];

  if (roles.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Recommended Roles"
          description="AI-suggested job titles based on your resume profile."
        />
        <EmptyState
          icon={Briefcase}
          title="No Recommendations Found"
          description="Upload your resume to allow Gemini AI to match your experience against industry job titles."
          actionLabel="Upload Resume"
          onAction={() => navigate('/upload')}
        />
      </div>
    );
  }

  // Prepare data for Recharts
  const chartData = roles.map((role) => ({
    name: role.title.length > 20 ? `${role.title.slice(0, 18)}...` : role.title,
    fullName: role.title,
    match: role.match_percent,
  }));

  const handleCompareClick = (roleTitle) => {
    navigate('/job-matching', { state: { prefilledTitle: roleTitle } });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Recommended Roles"
        description="Career trajectories and job positions that best match your demonstrated background."
        action={
          <Button variant="secondary" icon={Upload} onClick={() => navigate('/upload')}>
            Upload New Resume
          </Button>
        }
      />

      {/* Match Chart Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Role Match Alignment (%)</h3>
            <p className="text-xs text-slate-400">Calculated fit percentage across identified domains</p>
          </div>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip
                formatter={(val) => [`${val}% Fit`, 'Match Percent']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="match" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role, idx) => (
          <Card key={idx} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  {role.match_percent}% Match
                </span>
                <span className="text-xs text-slate-400 font-medium">Rank #{idx + 1}</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{role.title}</h4>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{role.reason}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Target Role</span>
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowRight}
                onClick={() => handleCompareClick(role.title)}
              >
                Compare With Job
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
