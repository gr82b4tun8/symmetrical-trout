import "@/styles/globals.css";
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
// components/GoogleAdSense.js for auto ads only
export default function GoogleAdsense() {
  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1549212779236114"
      crossOrigin="anonymous"
    />
  );
}