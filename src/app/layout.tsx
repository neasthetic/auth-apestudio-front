import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Auth - Ape Studio",
  description: "Auth - Ape Studio",
  // Favicon/icons: coloque os arquivos em /public (ex: public/favicon.ico, public/favicon-32x32.png)
  // O Next irá expor esses arquivos na raiz do site: /favicon.ico
  icons: {
    // Use a remote image as favicon (fallbacks can remain in /public if needed)
    icon: "https://i.ibb.co/7tg38TSR/noback-logo.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
