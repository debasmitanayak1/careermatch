import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScoreRing } from '../components/ui/ScoreRing';
import { SkillBadge } from '../components/ui/SkillBadge';
import { Loader } from '../components/ui/Loader';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';

export const JobMatching = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState(location.state?.prefilledTitle || '');
  const [jobDescription, setJobDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const fetchResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/resumes');
      setResumes(data || []);
      if (data?.length > 0) {
        setSelectedResumeId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
      setError(err.message || 'Could not load your saved resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleMatch = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedResumeId) {
      setError('Please select a resume to compare.');
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      setError('Please paste a job description with at least 50 characters.');
      return;
    }

    if (jobDescription.trim().length > 8000) {
      setError('Job description cannot exceed 8,000 characters.');
      return;
    }

    setMatching(true);
    try {
      const result = await api.post('/matches', {
        resumeId: selectedResumeId,
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
      });
      setMatchResult(result);
    } catch (err) {
      console.error('Match failed:', err);
      setError(err.message || 'Comparison failed. Please verify the input and try again.');
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return <Loader message="Loading resumes for matching..." />;
  }

  if (resumes.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Job Description Matcher"
          description="Compare your resume against any target job posting."
        />
        <EmptyState
          icon={FileText}
          title="No Resumes Available"
          description="You need to upload at least one PDF resume before running job description comparisons."
          actionLabel="Upload Resume Now"
          onAction={() => navigate('/upload')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Job Description Matcher"
        description="Compare your resume against target job requirements to reveal match score and skill gaps."
      />

      {error && <ErrorMessage message={error} className="mb-4" />}

      {/* Input Form Card */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleMatch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Selector */}
            <div>
              <label htmlFor="resume-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Select Resume Version
              </label>
              <select
                id="resume-select"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.file_name} ({new Date(r.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Job Title Input */}
            <div>
              <label htmlFor="job-title-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Target Job Title (Optional)
              </label>
              <input
                id="job-title-input"
                type="text"
                maxLength={100}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Job Description Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="job-description-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Paste Job Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {jobDescription.length} / 8000 characters (min 50)
              </span>
            </div>
            <textarea
              id="job-description-input"
              rows={8}
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting, required qualifications, and responsibilities here..."
              className="block w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono text-xs"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={matching}
              icon={Sparkles}
              disabled={matching}
              className="w-full sm:w-auto"
            >
              {matching ? 'Comparing with Gemini AI...' : 'Analyze Match Compatibility'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Match Results Display */}
      {matchResult && matchResult.result && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Comparison Results
          </h3>

          <Card className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-100">
                <ScoreRing
                  score={matchResult.result.match_score || 0}
                  size={140}
                  strokeWidth={11}
                  label="Match Compatibility"
                />
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Keyword & requirement overlap
                </p>
              </div>

              <div className="lg:col-span-8 space-y-3">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Fit Evaluation
                </span>
                <h4 className="text-lg font-bold text-slate-900">
                  {matchResult.job_title || 'Target Job Position'}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {matchResult.result.summary}
                </p>
              </div>
            </div>
          </Card>

          {/* Skills Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Matched Skills & Qualifications</h4>
                  <p className="text-xs text-slate-400">Found in both resume and job description</p>
                </div>
              </div>
              {matchResult.result.matched_skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {matchResult.result.matched_skills.map((skill, idx) => (
                    <SkillBadge key={idx} name={skill} variant="emerald" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No direct skills matched.</p>
              )}
            </Card>

            {/* Missing Skills */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Missing Skills & Keywords</h4>
                  <p className="text-xs text-slate-400">Keywords requested in job description not detected</p>
                </div>
              </div>
              {matchResult.result.missing_skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {matchResult.result.missing_skills.map((skill, idx) => (
                    <SkillBadge key={idx} name={skill} variant="rose" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No major missing skills identified!</p>
              )}
            </Card>
          </div>

          {/* AI Tailoring Suggestions */}
          {matchResult.result.suggestions?.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">
                  How to Tailor Your Resume for this Role
                </h4>
              </div>
              <ul className="space-y-3">
                {matchResult.result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
