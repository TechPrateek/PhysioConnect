import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { ThemeProvider } from "@/components/theme/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b132b" },
  ],
};

export const metadata: Metadata = {
  title: "PhysioConnect | Book Verified Physiotherapists in Etawah, UP",
  description:
    "Etawah's first on-demand physiotherapy booking platform. Book certified home visits and clinic appointments with licensed physiotherapists.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background text-foreground antialiased flex flex-col relative`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AmbientBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
