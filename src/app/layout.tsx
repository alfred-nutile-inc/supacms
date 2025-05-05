import Nav from '@/components/ui/nav';
import './globals.css';

export const metadata = {
  title: 'Supabase Forms Admin',
  description: 'No-code admin dashboard for Supabase-backed forms',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <Nav />
        <main className="max-w-5xl mx-auto pt-8">{children}</main>
      </body>
    </html>
  );
} 
