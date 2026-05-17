
export function AiCharacter({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Deep Glow Behind */}
      <div className="absolute inset-0 bg-emerald-400 opacity-60 blur-xl rounded-full animate-pulse shadow-[0_0_30px_rgba(52,211,153,0.5)]"></div>
      
      {/* Character Container - Rich Glassmorphism */}
      <div className="relative z-10 w-full h-full bg-gradient-to-tr from-[#022c22] to-[#064e3b] rounded-full border-[3px] border-emerald-300/50 shadow-2xl overflow-hidden flex flex-col items-center justify-end">
        
        {/* Subtle inner light */}
        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>

        {/* Abstract AI Doctor representation (Minimalist UI style) */}
        <div className="w-[65%] h-[65%] bg-gradient-to-t from-emerald-100 to-white rounded-t-full relative flex justify-center mt-auto animate-float shadow-inner" style={{ animationDuration: '4s' }}>
          
          {/* Head Sphere */}
          <div className="absolute -top-9 w-[3.5rem] h-[3.5rem] bg-gradient-to-br from-white to-emerald-50 rounded-full shadow-lg border border-emerald-100 flex items-center justify-center">
             
             {/* Vizor / Eyes */}
             <div className="w-8 h-3 bg-[#022c22] rounded-full shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-emerald-400/20"></div>
                {/* Glowing LED eyes */}
                <div className="absolute top-1 w-full flex justify-center gap-1.5 opacity-90">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,1)] animate-led-blink"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,1)] animate-led-blink"></div>
                </div>
             </div>
             
          </div>

          {/* Golden Stethoscope Necklace Mock */}
          <div className="absolute top-6 w-[4.5rem] h-10 border-b-2 border-l-2 border-r-2 border-emerald-800/80 rounded-b-full"></div>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-float {
          animation: float 4s infinite ease-in-out;
        }
        @keyframes led-blink {
          0%, 96%, 98% { opacity: 1; transform: scaleY(1); }
          97% { opacity: 0.5; transform: scaleY(0.2); }
        }
        .animate-led-blink {
          animation: led-blink 4s infinite linear;
        }
      `}</style>
    </div>
  );
}
