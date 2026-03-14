import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';

import ClarityLocation from '../components/clarity/ClarityLocation';
import AccurateMap from '../components/clarity/AccurateMap';
import TransparentPricing from '../components/clarity/TransparentPricing';

export default function ClarityDashboard() {
  const { isDarkMode, toggleDarkMode, pickupLocation, dropoffLocation } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('book'); 
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);
  const [touchStartY, setTouchStartY] = useState(0);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (pickupLocation && dropoffLocation) setIsSheetExpanded(true);
  }, [pickupLocation, dropoffLocation]);

  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);
  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const delta = touchEndY - touchStartY;
    if (delta > 40) setIsSheetExpanded(false); 
    else if (delta < -40) setIsSheetExpanded(true); 
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-black text-gray-900 dark:text-gray-100 font-sans">
      
      {/* LAYER 0: FULL BLEED MAP */}
      <div className="absolute inset-0 z-0">
        <AccurateMap />
      </div>

      {/* --- SIDEBAR DRAWER (z-[100]) --- */}
      <div className={`absolute inset-0 z-[100] pointer-events-none overflow-hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        <div className="w-full max-w-[420px] h-full mx-auto relative pointer-events-none">
          <div className={`absolute top-0 left-0 w-[80%] max-w-[320px] h-full bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ease-out pointer-events-auto flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 pt-16 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="w-14 h-14 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xl font-black text-white dark:text-black">M</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Ayaan</h2>
                <div className="flex items-center gap-1 mt-0.5">
                   <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                   <span className="text-xs font-bold text-gray-600 dark:text-gray-400">4.92 Rating</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {['Messages', 'Your Trips', 'Wallet', 'Safety', 'Settings'].map((item, i) => (
                <button key={i} onClick={() => setIsMenuOpen(false)} className="w-full text-left px-4 py-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold text-[17px] text-gray-700 dark:text-gray-200">
                  {item}
                </button>
              ))}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-800 pb-safe">
              <button onClick={toggleDarkMode} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl active:scale-95 transition-transform">
                <span className="font-bold text-[15px] text-gray-900 dark:text-white">Dark Mode</span>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'} relative`}>
                  <div className={`w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-6 bg-gray-900' : 'translate-x-0 bg-white'}`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOCK ACTIVITY TAB --- */}
      {activeTab === 'activity' && (
        <div className="absolute inset-0 z-30 bg-white dark:bg-black overflow-y-auto animate-fade-in pointer-events-auto">
          <div className="w-full max-w-[420px] mx-auto pb-24 md:pb-6 md:pt-24 px-5 pt-14 relative">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Activity</h2>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Past Rides</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">University Visvesvaraya...</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Mar 12 • 9:41 AM</p>
                  </div>
                </div>
                <span className="font-bold text-[15px] text-gray-900 dark:text-white">₹142</span>
              </div>
              <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-3"></div>
              <p className="text-[13px] font-medium text-gray-500 truncate">From Majestic Bus Stand</p>
            </div>
          </div>
        </div>
      )}

      {/* --- MOCK ACCOUNT TAB --- */}
      {activeTab === 'account' && (
        <div className="absolute inset-0 z-30 bg-white dark:bg-black overflow-y-auto animate-fade-in pointer-events-auto">
          <div className="w-full max-w-[420px] mx-auto pb-24 md:pb-6 md:pt-24 px-5 pt-14 min-h-full flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">Ayaan</h2>
                  <div className="flex items-center gap-1 mt-1 bg-gray-100 dark:bg-gray-900 w-max px-2 py-1 rounded-lg">
                    <svg className="w-3 h-3 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">4.92</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-2xl font-black text-black dark:text-white">M</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
                {['Help', 'Payment', 'Saved Places', 'Settings'].map((item, i) => (
                  <button key={i} className="w-full flex justify-between items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                    <span className="font-bold text-[15px] text-gray-900 dark:text-white">{item}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-center text-[11px] text-gray-400 font-bold uppercase tracking-widest pb-4">Uninode v1.0.0 • uninode.in</p>
          </div>
        </div>
      )}

      {/* LAYER 1 & 2: FLOATING UI OVER THE MAP */}
      {activeTab === 'book' && (
        <div className="absolute inset-0 z-10 pointer-events-none flex justify-center">
          <div className="w-full max-w-[420px] h-full relative pointer-events-none">
            
            {/* Hamburger - Hidden on Desktop (replaced by Sidebar) */}
            <div className="absolute top-12 left-5 z-40 pointer-events-auto md:hidden">
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform border border-gray-100 dark:border-gray-800"
              >
                <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>

            {/* Bottom Sheet */}
            <div 
              className={`absolute bottom-20 md:bottom-6 left-0 md:left-4 w-full md:w-[calc(100%-32px)] z-40 bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.15)] md:shadow-2xl pt-3 transition-all duration-300 ease-out flex flex-col pointer-events-auto ${
                isSheetExpanded ? 'h-[75vh] md:h-[70vh]' : 'h-auto max-h-[35vh]'
              }`}
            >
              <div 
                className="w-full pb-3 cursor-grab active:cursor-grabbing shrink-0"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsSheetExpanded(!isSheetExpanded)} 
              >
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto"></div>
              </div>
              
              <div className={`w-full max-w-lg mx-auto relative px-5 pb-10 overscroll-contain pb-safe no-scrollbar ${
  isSheetExpanded ? 'overflow-y-auto flex-1' : 'overflow-hidden'
}`}>
                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                
                <ClarityLocation />
                
                <div className={`transition-all duration-300 origin-top ${
                  isSheetExpanded ? 'opacity-100 scale-y-100 mt-2' : 'opacity-0 scale-y-0 h-0 overflow-hidden pointer-events-none mt-0'
                }`}>
                  <TransparentPricing />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* LAYER 3: RESPONSIVE NAV (Bottom Nav on Mobile, Sidebar on Desktop) */}
      <nav className="absolute bottom-0 md:bottom-auto md:top-0 md:left-0 w-full md:w-24 h-20 md:h-full z-50 pointer-events-auto flex md:flex-col justify-around md:justify-center md:gap-12 items-center px-6 md:px-0 pb-safe md:pb-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-gray-100 dark:border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-[10px_0_40px_rgba(0,0,0,0.05)]">
        
        {/* Replaced 'Home' with a Map Pin icon indicating 'Ride' */}
        <button onClick={() => setActiveTab('book')} className={`flex flex-col items-center gap-1.5 transition-colors group ${activeTab === 'book' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'book' ? 'bg-gray-100 dark:bg-gray-800' : 'group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50'}`}>
            {activeTab === 'book' ? (
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ) : (
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wide">Ride</span>
        </button>

        <button onClick={() => setActiveTab('activity')} className={`flex flex-col items-center gap-1.5 transition-colors group ${activeTab === 'activity' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'activity' ? 'bg-gray-100 dark:bg-gray-800' : 'group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50'}`}>
            {activeTab === 'activity' ? (
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wide">Activity</span>
        </button>

        <button onClick={() => setActiveTab('account')} className={`flex flex-col items-center gap-1.5 transition-colors group ${activeTab === 'account' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'account' ? 'bg-gray-100 dark:bg-gray-800' : 'group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50'}`}>
            {activeTab === 'account' ? (
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wide">Account</span>
        </button>
      </nav>

    </div>
  );
}