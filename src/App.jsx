import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import Dashboard from './views/Dashboard';
import ChaosLogin from './views/chaosLogin';

export default function App() {
  const { isChaosMode, toggleChaosMode, activeView } = useAppStore();

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

  return (
    <>
      {/* Global Mode Indicator */}
      <div className="fixed top-0 left-0 w-full p-1 text-[9px] font-mono bg-black text-gray-400 opacity-20 hover:opacity-100 pointer-events-none z-[9999] text-center tracking-widest transition-opacity hidden md:block">
        SYSTEM MODE: {isChaosMode ? 'CHAOS_ACTIVE' : 'CLARITY_ACTIVE'} | PRESS CTRL+SHIFT+K TO TOGGLE
      </div>

      {/* The View Router */}
      {isChaosMode ? (
        activeView === 'login' ? <ChaosLogin /> : <Dashboard />
      ) : (
        <div className="min-h-screen bg-white max-w-md mx-auto pt-12 px-4 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Clarity Mode</h1>
          <p className="text-gray-500 text-center">
            Round 2 components will go here. The chaos router has been disabled.
          </p>
        </div>
      )}
    </>
  );
}