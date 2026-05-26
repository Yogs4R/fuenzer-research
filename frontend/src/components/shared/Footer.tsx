export function Footer() {
  return (
    <footer className="bg-paper-white dark:bg-ink-black border-t border-cloud-canvas dark:border-stone-gray text-stone-gray dark:text-silver-mist py-12 text-xs transition-colors">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <img 
            src="/assets/light/fuenzer-research-logo-light.webp" 
            alt="Fuenzer Research" 
            className="h-10 md:h-12 object-contain dark:hidden" 
          />
          <img 
            src="/assets/dark/fuenzer-research-logo-dark.webp" 
            alt="Fuenzer Research" 
            className="h-10 md:h-12 object-contain hidden dark:block" 
          />
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 uppercase tracking-widest font-semibold font-sans text-[10px] md:text-xs">
          <a href="https://github.com/Yogs4R/fuenzer-research" className="hover:text-ink-black dark:hover:text-paper-white transition-colors">GITHUB</a>
          <a href="mailto:fuenzerofficial@gmail.com" className="hover:text-ink-black dark:hover:text-paper-white transition-colors">CONTACT</a>
          <a href="/terms" className="hover:text-ink-black dark:hover:text-paper-white transition-colors">TERMS OF SERVICE</a>
          <a href="/privacy" className="hover:text-ink-black dark:hover:text-paper-white transition-colors">PRIVACY POLICY</a>
        </div>
      </div>
      <div className="text-center mt-12 text-silver-mist dark:text-stone-gray font-sans">
        © {new Date().getFullYear()} Fuenzer Research. All rights reserved.
      </div>
    </footer>
  );
}
