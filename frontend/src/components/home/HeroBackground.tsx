export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none h-full">
      {/* Grid Pattern — capped to top 45% of the page, fades out at bottom */}
      <div
        className="absolute inset-x-0 top-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-size-[72px_72px]"
        style={{
          height: '45%',
          maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
        }}
      />

      {/* Animated Data Points — confined to top 40% */}
      <div className="absolute top-[8%] left-[5%] w-3 h-3 rounded-full bg-fuenzer-teal/40 animate-pulse" />
      <div className="absolute top-[25%] right-[6%] w-4 h-4 rounded-full bg-fuenzer-teal/25 animate-ping" />
      <div className="absolute top-[35%] left-[8%] w-2 h-2 rounded-full bg-fuenzer-teal/50 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[15%] right-[12%] w-3 h-3 rounded-full bg-fuenzer-teal/35 animate-pulse" style={{ animationDelay: '0.5s' }} />

      {/* Floating Plus Signs — confined to top 40% */}
      <div className="absolute top-[12%] left-[10%] text-fuenzer-teal/30 text-2xl font-bold animate-[bounce_4s_infinite]" style={{ animationDelay: '0.2s' }}>+</div>
      <div className="absolute top-[30%] right-[8%] text-fuenzer-teal/20 text-3xl font-bold animate-[bounce_5s_infinite]" style={{ animationDelay: '1.5s' }}>+</div>
      <div className="absolute top-[5%] right-[20%] text-fuenzer-teal/40 text-xl font-bold animate-[pulse_3s_infinite]">+</div>

      {/* Crosshair 1 */}
      <div className="absolute top-[10%] right-[18%] opacity-40 dark:opacity-30 animate-[spin_10s_linear_infinite]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V22" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <path d="M2 12H22" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Crosshair 2 */}
      <div className="absolute top-[28%] left-[4%] opacity-35 dark:opacity-25 animate-[spin_12s_linear_infinite_reverse]">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V22" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <path d="M2 12H22" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Subtle teal glow at very top only */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-fuenzer-teal/5 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
    </div>
  );
}
