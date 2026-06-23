(function() {
  const gaId = "G-8WBME81KPS";
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  let consent = 'denied';
  try {
    consent = localStorage.getItem('cookie-consent') || 'denied';
  } catch (e) {}

  gtag('consent', 'default', {
    'analytics_storage': consent === 'accepted' ? 'granted' : 'denied',
    'ad_storage': consent === 'accepted' ? 'granted' : 'denied',
    'personalization_storage': consent === 'accepted' ? 'granted' : 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted'
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
  document.head.appendChild(script);

  gtag('js', new Date());
  gtag('config', gaId);
})();
