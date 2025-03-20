// components/GoogleAdSense.js
import { useEffect } from 'react';

export default function GoogleAdSense() {
  useEffect(() => {
    try {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1549212779236114';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);
  
  return null;
}

// Then in _app.js
import GoogleAdSense from '../components/GoogleAdSense';

export default function App({ Component, pageProps }) {
  return (
    <>
      <GoogleAdSense />
      <Component {...pageProps} />
    </>
  );
}