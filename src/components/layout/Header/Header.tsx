import Link from 'next/link';
import './Header.css';
import UserMenu from '@/components/shared/UserMenu/UserMenu';

export default function Header() {
  return (
    <header className="site-header">
      <h4>
        <Link href="/" className="logo">
          AI Knowledge Hub
        </Link>
      </h4>

      <UserMenu />
    </header>
  );
}
