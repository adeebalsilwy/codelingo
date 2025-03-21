import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { NotificationPrompt } from "@/app/components/NotificationPrompt";
import { PWAInstallPrompt } from "@/app/components/PWAInstallPrompt";
import { Providers } from "@/app/providers";
import "./globals.css";

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
      <html>
        <head>
          <link rel="manifest" href="/manifest.json" id="manifest-link" />
          <meta name="theme-color" content="#22c55e" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="application-name" content="Edu PRO" />
          <meta name="apple-mobile-web-app-title" content="Edu PRO" />
        </head>
        <body className={font.className}>
          <Providers>
            <Toaster />
            <ExitModal />
            <HeartsModal />
            <PracticeModal />
            <NotificationPrompt />
            <PWAInstallPrompt />
            {children}
          </Providers>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('New service worker available.');
                              const event = new CustomEvent('serviceWorkerUpdateAvailable');
                              window.dispatchEvent(event);
                            }
                          });
                        }
                      });
                      
                    }, function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                    
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
    </ClerkProvider>
  );
}
