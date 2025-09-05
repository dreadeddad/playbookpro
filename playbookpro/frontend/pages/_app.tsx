import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Playbook Pro - Basketball Coaching Platform</title>
        <meta name="description" content="Interactive basketball coaching platform with 3D playbooks and AI feedback" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Meta tags */}
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Playbook Pro - Basketball Coaching Platform" />
        <meta property="og:description" content="Interactive basketball coaching platform with 3D playbooks and AI feedback" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Playbook Pro - Basketball Coaching Platform" />
        <meta name="twitter:description" content="Interactive basketball coaching platform with 3D playbooks and AI feedback" />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>
      
      <Component {...pageProps} />
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f3f4f6',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f3f4f6',
            },
          },
        }}
      />
    </>
  );
}