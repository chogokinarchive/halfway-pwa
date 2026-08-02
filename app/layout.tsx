import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Halfway — Meet halfway between Italy and Japan",
  description:
    "Halfway connects Italian and Japanese people through language learning, cultural exchange, and community.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Halfway",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1512" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
