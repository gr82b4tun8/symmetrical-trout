import "@/styles/globals.css";
import Script from 'next/script';

// Correctly integrate the Google AdSense component
export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Google AdSense Script */}
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1549212779236114"
        crossOrigin="anonymous"
      />
      
      {/* Main application component */}
      <Component {...pageProps} />
    </>
  );
}