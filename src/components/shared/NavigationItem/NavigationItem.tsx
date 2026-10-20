'use client';

import { SidebarItem } from '@/components/layout/Sidebar/Sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

function NavigationItemContent({ icon, name, path }: SidebarItem) {
  const pathname = usePathname();
  const isActive = pathname === path || (path !== '/' && pathname.startsWith(`${path}/`));

  return <NavigationItemLink icon={icon} name={name} path={path} isActive={isActive} />;
}

function NavigationItemLink({
  icon,
  name,
  path,
  isActive = false,
}: SidebarItem & { isActive?: boolean }) {
  return (
    <Link href={path} className={`nav-item ${isActive ? 'active' : ''}`}>
      {icon && <Image src={icon} alt={name} width={24} height={24} className="nav-icon" />}
      <span>{name}</span>
    </Link>
  );
}

export default function NavigationItem(props: SidebarItem) {
  return (
    <Suspense fallback={<NavigationItemLink {...props} />}>
      <NavigationItemContent {...props} />
    </Suspense>
  );
}
