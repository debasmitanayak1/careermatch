import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// Protected pages
import { Dashboard } from './pages/Dashboard';
import { ResumeUpload } from './pages/ResumeUpload';
import { ResumeAnalysis } from './pages/ResumeAnalysis';
import { JobRecommendations } from './pages/JobRecommendations';
import { JobMatching } from './pages/JobMatching';
import { CareerImprovement } from './pages/CareerImprovement';
import { History } from './pages/History';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/analysis" element={<ResumeAnalysis />} />
          <Route path="/recommendations" element={<JobRecommendations />} />
          <Route path="/job-matching" element={<JobMatching />} />
          <Route path="/improvement" element={<CareerImprovement />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
