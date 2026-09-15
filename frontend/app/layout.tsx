import "./globals.css";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SunIcon, MoonIcon } from "lucide-react";

export const metadata = {
  title: "MVP Conciliación Bancaria Chile",
  description: "Sistema de conciliación bancaria y de facturas SII",
};

function Canvas({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    // Set dark mode based on system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.add(prefersDark ? "dark" : "light");
  }, []);

  return (
    <html lang="es" className="h-full w-full bg-background foreground-font antialiased">
      <body className="h-full w-full bg-background text-font antialiased">
        <Canvas>{children}</Canvas>
      </body>
    </html>
  );
}