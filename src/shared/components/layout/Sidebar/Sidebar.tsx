import NavigationItem from '@/shared/components/ui/NavigationItem/NavigationItem';
import { SIDEBAR_CONFIG } from './sidebar.constants';
import './Sidebar.css';

export interface SidebarItem {
  name: string;
  path: string;
  icon: string;
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        {SIDEBAR_CONFIG.map((config: SidebarItem) => (
          <NavigationItem key={config.path} {...config} />
        ))}
      </nav>
    </aside>
  );
}
