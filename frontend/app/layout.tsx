import "./globals.css";
import type { ReactNode } from "react";

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
  return (
    <html lang="es" className="h-full w-full bg-background foreground-font antialiased">
      <body className="h-full w-full bg-background text-font antialiased">
        <Canvas>{children}</Canvas>
      </body>
    </html>
  );
}