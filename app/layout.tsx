import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { NotificationPrompt } from "@/app/components/NotificationPrompt";
import { PWAInstallPrompt } from "@/app/components/PWAInstallPrompt";
import { I18nProvider } from "./i18n/client";
import "./globals.css";
import Script from "next/script";
import { Providers } from "@/app/providers";

const font = Nunito({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: {
    template: '%s | Edu PRO',
    default: 'Edu PRO - Learn Programming',
  },
  description: 'Learn programming languages easily with Edu PRO',
  manifest: "/manifest.json",
  icons: {
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  applicationName: "Edu PRO",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Edu PRO",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "google-play-app": "app-id=com.edupro.app",
  },
  alternates: {
    languages: {
      'en': '/en',
      'ar': '/ar',
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <I18nProvider>
        <html className={font.variable}>
          <head>
            <link rel="manifest" href="/manifest.json" id="manifest-link" />
            <meta name="theme-color" content="#22c55e" />
            <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="application-name" content="Edu PRO" />
            <meta name="apple-mobile-web-app-title" content="Edu PRO" />
            <Script
              id="dynamic-manifest"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  // Check for saved language preference
                  const savedLanguage = localStorage.getItem('language');
                  if (savedLanguage === 'ar') {
                    document.getElementById('manifest-link').setAttribute('href', '/manifest-ar.json');
                    document.documentElement.lang = 'ar';
                    document.documentElement.dir = 'rtl';
                  } else {
                    document.getElementById('manifest-link').setAttribute('href', '/manifest.json');
                    document.documentElement.lang = 'en';
                    document.documentElement.dir = 'ltr';
                  }
                `,
              }}
            />
          </head>
          <body className={font.className}>
            <Toaster />
            <ExitModal />
            <HeartsModal />
            <PracticeModal />
            <NotificationPrompt />
            <PWAInstallPrompt />
            <Providers>
              {children}
            </Providers>
            <Script
              id="register-service-worker"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', function() {
                          const newWorker = registration.installing;
                          if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New update available
                                console.log('New service worker available.');
                                
                                // Send event to the app to show update notification
                                const event = new CustomEvent('serviceWorkerUpdateAvailable');
                                window.dispatchEvent(event);
                              }
                            });
                          }
                        });
                        
                      }, function(err) {
                        console.log('ServiceWorker registration failed: ', err);
                      });
                      
                      // Handle Service Worker updates
                      let refreshing = false;
                      navigator.serviceWorker.addEventListener('controllerchange', function() {
                        if (!refreshing) {
                          refreshing = true;
                          window.location.reload();
                        }
                      });
                    });
                  }
                `,
              }}
            />
          </body>
        </html>
      </I18nProvider>
    </ClerkProvider>
  );
}
