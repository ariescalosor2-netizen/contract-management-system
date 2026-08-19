import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-60">
        
        <Topbar
          onMenuClick={toggleSidebar}
        />

        <main className="p-4 sm:p-6">
          {children}
        </main>

      </div>
    </div>
  );
}

export default MainLayout;