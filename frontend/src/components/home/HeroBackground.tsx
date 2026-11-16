export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none h-full" aria-hidden="true">
      {/* Static Whiteboard Blueprint Grid — DESIGN.md motif, fades cleanly before content sections */}
      <div
        className="absolute inset-x-0 top-0 h-[1100px]"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
        }}
      >
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-size-[72px_72px]"
          style={{
            maskImage: 'linear-gradient(to right, black 0%, black 15%, transparent 30%, transparent 70%, black 85%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 15%, transparent 30%, transparent 70%, black 85%, black 100%)',
          }}
        />
      </div>

      {/* Static Blueprint Coordinate Markers */}
      <div className="absolute top-[10%] right-[18%] opacity-30 dark:opacity-20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M2 12H22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute top-[28%] left-[4%] opacity-25 dark:opacity-20">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M2 12H22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
