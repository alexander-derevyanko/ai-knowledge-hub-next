import Link from 'next/link';
import { Suspense } from 'react';

import UserMenu from '@/shared/components/ui/UserMenu/UserMenu';

import './Header.css';

export default function Header() {
  return (
    <header className="site-header">
      <h4>
        <Link href="/" className="logo">
          AI Knowledge Hub
        </Link>
      </h4>

      <Suspense fallback={null}>
        <UserMenu />
      </Suspense>
    </header>
  );
}
