import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';

type AppLayoutProps = { children: React.ReactNode };

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Header />

      <div className="page-layout">
        <Sidebar />

        <main className="main-content">{children}</main>
      </div>
    </>
  );
}
