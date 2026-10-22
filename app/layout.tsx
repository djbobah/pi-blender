import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXUS — одно ядро. Любой AI-процесс.",
  description:
    "Агентная среда выполнения для продуктовых команд. Контекст, инструменты и проверки вокруг любой модели.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
