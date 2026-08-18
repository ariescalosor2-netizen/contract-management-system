import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <Sidebar />

      {/* Dapat pareho sa width ng Sidebar (w-60) */}
      <div className="flex-1 ml-60">
        <Topbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;