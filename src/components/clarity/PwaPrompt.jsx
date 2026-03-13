import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';

export default function PwaPrompt() {
  const { deferredPrompt, setDeferredPrompt, isDarkMode } = useAppStore();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent Chrome's automatic banner
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [setDeferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 p-4 rounded-2xl shadow-xl flex items-center justify-between z-[9999] border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
          <span className="text-white font-bold">go</span>
        </div>
        <div>
          <h4 className="font-bold text-sm">Install gocab</h4>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add to home screen for faster booking</p>
        </div>
      </div>
      <button 
        onClick={handleInstallClick}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-full transition-colors"
      >
        Get App
      </button>
    </div>
  );
}