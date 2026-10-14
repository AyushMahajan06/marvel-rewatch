import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The long way to Doomsday | Ayush's rewatch",
  description: "Ayush's Marvel watchlist, Bluesky reviews, and viewing-time planner.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
