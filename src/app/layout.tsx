import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Workly | Production-Ready AI Workflow Automation SaaS',
  description: 'Design workflows with xAI Grok-2, connect external tools, and execute automated actions with real-time auditability and SSRF safety.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
