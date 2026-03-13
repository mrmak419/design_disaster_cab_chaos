import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import Dashboard from './views/Dashboard'; // Your existing Chaos Dashboard
import ClarityDashboard from './views/ClarityDashboard'; // We will create this
import PwaPrompt from './components/clarity/PwaPrompt';

export default function App() {
  const { isChaosMode, toggleChaosMode, isDarkMode } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        toggleChaosMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleChaosMode]);

  // Apply dark mode class to root HTML element for Tailwind
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className="min-h-screen w-full font-sans transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100 bg-gray-50 text-gray-900 overflow-x-hidden">
      
      {/* Hidden Presenter Toggle Status */}
      

      <PwaPrompt />

      {isChaosMode ? (
        /* THE PRESENTATION SPLIT SCREEN (Desktop Only) */
        <div className="hidden md:grid md:grid-cols-2 w-full h-screen">
          {/* Left Side: The Production App */}
          <div className="w-full h-full overflow-y-auto border-r-4 border-black bg-gray-50 dark:bg-gray-900 relative">
            <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded z-[9999] uppercase tracking-wider">
              Round 2: Clarity
            </div>
            <ClarityDashboard />
          </div>
          
          {/* Right Side: The Nightmare App */}
          <div className="w-full h-full overflow-y-auto bg-white relative">
            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-[9999] uppercase tracking-wider">
              Round 1: Chaos
            </div>
            {/* We force the scale down slightly so it fits nicely in the half-screen */}
            <div className="transform origin-top scale-90">
              <Dashboard />
            </div>
          </div>
        </div>
      ) : (
        /* THE DEFAULT PRODUCTION VIEW (Mobile + Desktop) */
        <div className="w-full">
          <ClarityDashboard />
        </div>
      )}

      {/* Fallback for Mobile if Chaos is active: Just show Clarity to protect the mobile demo */}
      {isChaosMode && (
        <div className="md:hidden w-full">
          <ClarityDashboard />
        </div>
      )}
    </div>
  );
}