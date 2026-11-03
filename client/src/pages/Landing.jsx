import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Background glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-300/30 to-violet-400/30 blur-3xl -z-10 rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/60 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-8 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Google Gemini 2.5 AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight md:leading-[1.15]">
            Land Your Dream Role with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              AI-Powered Resume Precision
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Upload your resume, unlock deep ATS score evaluations, instantly compare against job descriptions, and receive tailored action steps to land more interviews.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" icon={ArrowRight} className="w-full sm:w-auto shadow-md">
                Analyze My Resume Now
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Sign In to Account
              </Button>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <Card className="p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Instant AI Analysis</h3>
              <p className="text-sm text-slate-500 mt-2">
                Extract technical skills, assess strengths and weaknesses, and calculate an overall ATS readiness score.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Job Description Matching</h3>
              <p className="text-sm text-slate-500 mt-2">
                Paste any target job description to pinpoint missing keywords and see exact alignment percentages.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Actionable Roadmap</h3>
              <p className="text-sm text-slate-500 mt-2">
                Prioritized improvement recommendations categorized by impact so you know exactly what to tweak first.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Highlights Bar */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Real-time Gemini Analysis</h4>
              <p className="text-xs text-slate-500 mt-0.5">Zero mock data. Authentic AI evaluations every time.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Private & Secure Storage</h4>
              <p className="text-xs text-slate-500 mt-0.5">Isolated Row-Level Security on Supabase storage.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Targeted Role Recommendations</h4>
              <p className="text-xs text-slate-500 mt-0.5">Discover roles best matching your true demonstrated skills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} CareerMatch AI. All rights reserved.</p>
      </footer>
    </div>
  );
};
