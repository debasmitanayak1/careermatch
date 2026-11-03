import { useState, useEffect } from 'react';
import { User, Mail, Shield, Check, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export const Profile = () => {
  const { user, signOut, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile(fullName);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile information.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        title="User Profile"
        description="Manage your account settings and personal details."
      />

      {error && <ErrorMessage message={error} className="mb-4" />}

      {success && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-emerald-800 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Account Info Form Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {user?.fullName || 'Job Seeker'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Full Name
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Name"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Email Address (Read-only)
            </label>
            <div className="relative rounded-xl shadow-xs opacity-75">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="profile-email"
                type="email"
                disabled
                value={user?.email || ''}
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Session Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Active Session</h4>
              <p className="text-xs text-slate-400">Neon DB JWT Authenticated Session</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={LogOut}
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
