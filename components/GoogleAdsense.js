// 1. First, create a component for AdSense ads
// components/GoogleAdsense.js
import { useEffect } from 'react';
import Script from 'next/script';

export default function GoogleAdsense({ adSlot, adFormat = 'auto', fullWidthResponsive = true }) {
  useEffect(() => {
    // Push ad slots for initialization when component mounts
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <>
      {/* AdSense initialization script - place this in your Layout component instead if you have multiple ad units */}
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        crossOrigin="anonymous"
      />
      
      {/* Ad unit */}
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </>
  );
}

// 2. Usage in any page or component
// pages/blog/[slug].js
import GoogleAdsense from '@/components/GoogleAdsense';

export default function BlogPost({ post }) {
  return (
    <div className="blog-container">
      <h1>{post.title}</h1>
      
      {/* Display ad after the introduction */}
      <div className="post-intro">{post.introduction}</div>
      <div className="ad-container">
        <GoogleAdsense adSlot="1234567890" />
      </div>
      
      <div className="post-content">{post.content}</div>
      
      {/* Display another ad at the bottom */}
      <div className="ad-container">
        <GoogleAdsense adSlot="0987654321" adFormat="rectangle" fullWidthResponsive={false} />
      </div>
    </div>
  );
}