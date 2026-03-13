import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import ClarityLocation from '../components/clarity/ClarityLocation';
// import ClarityMap from '../components/clarity/ClarityMap'; // Your teammate will build this
import ClarityPricing from '../components/clarity/ClarityPricing';

export default function ClarityDashboard() {
  const { isDarkMode, toggleDarkMode } = useAppStore();
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'profile'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col font-sans">
      
      {/* Production Header */}
      <header className="px-6 py-4 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10 sticky top-0">
        <h1 className="text-2xl font-black tracking-tighter">
          Local<span className="text-blue-600 dark:text-blue-400">host</span>
        </h1>
        
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          
          {/* Profile Avatar Button */}
          <button 
            onClick={() => setActiveTab(activeTab === 'profile' ? 'book' : 'profile')}
            className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-gray-800 overflow-hidden shadow-sm"
          >
            <svg className="w-full h-full text-blue-600 dark:text-blue-400 p-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 p-4 max-w-lg mx-auto w-full">
        {activeTab === 'profile' ? (
          /* Clean, Transparent Profile UI */
          <div className="animate-fade-in space-y-6 pt-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                 <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Mohammad Ayaan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">+91 98765 43210</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Verified Account</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-800">
              {['Payment Methods', 'Ride History', 'Saved Places', 'Support & Safety'].map((item, i) => (
                <button key={i} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{item}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
            <button className="w-full py-4 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 rounded-2xl">Log Out</button>
          </div>
        ) : (
          /* The Core Booking Pipeline */
          <div className="animate-fade-in space-y-4 pt-2">
            <ClarityLocation />
            
            {/* TEAMMATE'S MAP GOES HERE. 
              It should read 'pickupLocation' and 'dropoffLocation' from Zustand, 
              and write 'distance' to Zustand via setDistance(km).
            */}
            {/* <ClarityMap /> */}
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-mono text-sm">
              [ Teammate's Map Component ]
            </div>

            <ClarityPricing />
          </div>
        )}
      </main>
    </div>
  );
}