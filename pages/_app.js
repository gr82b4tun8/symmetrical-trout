// pages/_app.js
import "@/styles/globals.css";
import GoogleAdSense from '../components/GoogleAdSense';

export default function App({ Component, pageProps }) {
  return (
    <>
      <GoogleAdSense />
      <Component {...pageProps} />
    </>
  );
}