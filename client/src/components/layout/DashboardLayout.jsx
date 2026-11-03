import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Sidebar for both desktop & mobile */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main content wrapper */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header Bar */}
        <div className="md:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar navigation"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>CareerMatch AI</span>
          </div>
          <div className="w-6" /> {/* spacer */}
        </div>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
