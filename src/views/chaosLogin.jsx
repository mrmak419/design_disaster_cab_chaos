import { useState } from 'react';
import { useAppStore } from '../store/appStore';

export default function ChaosLogin() {
  const { setView } = useAppStore();
  const [phoneNumber, setPhoneNumber] = useState(5000000000);
  const [isGlitching, setIsGlitching] = useState(false);

  const handleSliderChange = (e) => {
    setPhoneNumber(Number(e.target.value));
  };

  const handleFakeSubmit = (e) => {
    e.preventDefault();
    setIsGlitching(true);
    setTimeout(() => {
      setIsGlitching(false);
      alert(`Verification code sent to +91 ${phoneNumber}. Please wait 4-6 business days.`);
    }, 600);
  };

  const handleInputClick = () => {
    // Punish them for trying to type by randomizing the number
    setPhoneNumber(Math.floor(Math.random() * 8999999999) + 1000000000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className={`w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 border border-gray-100 transition-all ${isGlitching ? 'blur-sm scale-95 translate-x-2' : ''}`}>
        
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Verify your identity</h1>
          <p className="text-sm text-gray-500 mt-2">Please select your 10-digit mobile number using the precision slider below.</p>
        </div>

        <form onSubmit={handleFakeSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Mobile Number
            </label>
            
            {/* The read-only input that punishes typing */}
            <input 
              type="text"
              readOnly
              value={`+91 ${phoneNumber}`}
              onClick={handleInputClick}
              className="w-full text-center text-4xl font-black text-gray-900 bg-transparent border-none outline-none mb-6 cursor-pointer selection:bg-transparent"
            />

            {/* The Impossible Slider */}
            <input 
              type="range"
              min="1000000000"
              max="9999999999"
              step="1"
              value={phoneNumber}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-ew-resize accent-blue-600"
            />
            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-mono">
              <span>1000000000</span>
              <span>9999999999</span>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-md"
          >
            Send OTP
          </button>
        </form>
      </div>

      {/* The Escape Hatch: Almost invisible, low contrast, microscopic text */}
      <button 
        onClick={() => setView('dashboard')}
        className="mt-8 text-[9px] text-gray-200 hover:text-gray-400 transition-colors bg-transparent border-none outline-none cursor-pointer tracking-widest"
      >
        PROCEED AS UNVERIFIED GUEST
      </button>
    </div>
  );
}