import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import PageTransition from "@/components/PageTransition";
import { EditProvider } from "@/components/EditProvider";
import SaveOverlay from "@/components/SaveOverlay";
import EditToggle from "@/components/EditToggle";

export const metadata: Metadata = {
  title: "风上心's Life OS",
  description: "A personal life operating system — documenting days on Earth and beyond.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <CustomCursor />
        <EditProvider>
          <SaveOverlay />
          <EditToggle />
          <SmoothScroll>
            <Navbar />
            <div className="flex-1 flex flex-col">
              <PageTransition>{children}</PageTransition>
            </div>
            <Footer birthDate="2003-02-28" daysOnEarth={8506} />
          </SmoothScroll>
        </EditProvider>
      </body>
    </html>
  );
}
