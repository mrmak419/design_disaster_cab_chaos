import { useEffect } from 'react';
import { useAppStore } from './store/appStore';

export default function App() {
  const { isChaosMode, toggleChaosMode } = useAppStore();

  // Hidden keystroke listener: Ctrl + Shift + K toggles modes
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
    <div className={`min-h-screen transition-colors duration-300 ${isChaosMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="absolute top-4 left-4 p-2 text-xs font-mono text-gray-500 opacity-50 pointer-events-none">
        Debug: {isChaosMode ? 'CHAOS_ACTIVE' : 'CLARITY_ACTIVE'}
      </div>
      
      {/* We will route your components here next */}
    </div>
  );
}