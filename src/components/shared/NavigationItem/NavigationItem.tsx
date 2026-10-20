'use client';

import { SidebarItem } from '@/components/layout/Sidebar/Sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function NavigationItem({ icon, name, path }: SidebarItem) {
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <Link href={path} className={`nav-item ${isActive ? 'active' : ''}`}>
      {icon && <Image src={icon} alt={name} width={24} height={24} className="nav-icon" />}
      <span>{name}</span>
    </Link>
  );
}
