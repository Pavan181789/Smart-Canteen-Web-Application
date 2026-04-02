/**
 * Monitoring Page
 * Main page for the real-time monitoring dashboard
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { ThemeProvider } from '../context/ThemeContext';
import ProfessionalMonitoringDashboard from '../monitoring/components/ProfessionalMonitoringDashboard';

const MonitoringPage = () => {
  return (
    <>
      <Helmet>
        <title>Real-Time Performance Monitoring | Smart Canteen</title>
        <meta name="description" content="Advanced real-time performance monitoring and downtime analysis system" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Real-Time Performance Monitoring | Smart Canteen" />
        <meta property="og:description" content="Advanced real-time performance monitoring and downtime analysis system" />
        <meta property="og:image" content="/monitoring-preview.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Real-Time Performance Monitoring | Smart Canteen" />
        <meta property="twitter:description" content="Advanced real-time performance monitoring and downtime analysis system" />
        <meta property="twitter:image" content="/monitoring-preview.png" />
        
        {/* Additional SEO */}
        <meta name="keywords" content="monitoring, performance, uptime, downtime, analytics, dashboard, real-time" />
        <meta name="author" content="Smart Canteen Team" />
        <meta name="robots" content="index, follow" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/monitoring-icon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/monitoring/manifest.json" as="fetch" crossOrigin="anonymous" />
        
        {/* Theme */}
        <meta name="theme-color" content="#111827" />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Security */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Smart Canteen Monitoring System",
            "description": "Advanced real-time performance monitoring and downtime analysis system",
            "url": window.location.origin,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Organization",
              "name": "Smart Canteen Team"
            }
          })}
        </script>
      </Helmet>

      <main className="min-h-screen">
        <ThemeProvider>
          <ProfessionalMonitoringDashboard />
        </ThemeProvider>
      </main>
    </>
  );
};

export default MonitoringPage;
