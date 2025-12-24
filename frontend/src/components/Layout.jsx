import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header fixe en haut */}
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Container principal avec sidebar et contenu */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar fixe à gauche */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Zone de contenu scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
