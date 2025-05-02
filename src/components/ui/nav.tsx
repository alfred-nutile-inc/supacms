import Link from 'next/link';
import { LogoutButton } from '../logout-button';

export default function Nav() {
  return (
    <nav className="bg-zinc-900 text-zinc-100 px-6 py-4 flex items-center justify-between shadow">
      <div className="flex items-center gap-6">
        <Link href="/forms" className="text-lg font-bold hover:text-primary transition-colors">Forms</Link>
      </div>
      <div>
        <LogoutButton />
      </div>
    </nav>
  );
} 