import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [animate, setAnimate] = useState(false);
  const { language } = useUiStore();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const showTimer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(showTimer);
    }
  }, []);

  useEffect(() => {
    if (showBanner) {
      const animTimer = setTimeout(() => setAnimate(true), 100);
      return () => clearTimeout(animTimer);
    } else {
      setAnimate(false);
    }
  }, [showBanner]);

  const handleConsent = (accepted: boolean) => {
    const status = accepted ? 'accepted' : 'rejected';
    localStorage.setItem('cookie-consent', status);

    // Sync with Google Tag Manager
    if ((window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': accepted ? 'granted' : 'denied',
        'ad_storage': accepted ? 'granted' : 'denied',
        'personalization_storage': accepted ? 'granted' : 'denied'
      });
    }

    setAnimate(false);
    setTimeout(() => {
      setShowBanner(false);
    }, 500);
  };

  if (!showBanner) return null;

  const isEn = language === 'en';
  const title = isEn ? 'Cookie Consent' : 'Persetujuan Cookie';
  const desc = isEn 
    ? 'We use cookies to analyze traffic and enhance your scientific research experience. By clicking \'Accept\', you agree to our use of Google Analytics. Learn more in our '
    : 'Kami menggunakan cookie untuk menganalisis lalu lintas dan meningkatkan pengalaman riset ilmiah Anda. Dengan mengeklik \'Setuju\', Anda menyetujui penggunaan Google Analytics. Pelajari selengkapnya di ';
  const policyLinkText = isEn ? 'Privacy Policy' : 'Kebijakan Privasi';
  const rejectText = isEn ? 'Reject' : 'Tolak';
  const acceptText = isEn ? 'Accept' : 'Setuju';

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 w-full bg-paper-white/95 dark:bg-ink-black/95 backdrop-blur-md border-t border-cloud-canvas dark:border-stone-gray z-50 transition-all duration-500 ease-out transform py-4 px-6 font-sans ${
        animate ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Text Area */}
        <div className="flex-grow text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-black dark:text-paper-white">{title}</h4>
          <p className="text-xs text-stone-gray dark:text-silver-mist mt-1 leading-relaxed max-w-4xl">
            {desc}
            <Link to="/privacy" className="text-fuenzer-teal hover:underline underline-offset-2 font-medium">
              {policyLinkText}
            </Link>
            .
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 md:shrink-0 justify-end">
          <button
            onClick={() => handleConsent(false)}
            className="px-4 py-2 text-xs font-semibold text-stone-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white border border-cloud-canvas dark:border-stone-gray hover:border-silver-mist rounded-xl transition-all cursor-pointer bg-transparent active:scale-95"
          >
            {rejectText}
          </button>
          <button
            onClick={() => handleConsent(true)}
            className="bg-fuenzer-teal hover:bg-fuenzer-teal-dark text-paper-white px-5 py-2 text-xs font-bold rounded-xl shadow transition-all cursor-pointer border-none active:scale-95"
          >
            {acceptText}
          </button>
        </div>
      </div>
    </div>
  );
}
