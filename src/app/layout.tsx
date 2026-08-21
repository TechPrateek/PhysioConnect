import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { ThemeProvider } from "@/components/theme/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PhysioConnect | Book Verified Physiotherapists in Etawah, UP",
  description:
    "Etawah's first on-demand physiotherapy booking platform. Book certified home visits and clinic appointments with licensed physiotherapists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased flex flex-col relative`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AmbientBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
