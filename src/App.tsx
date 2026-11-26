import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ScegmanProvider } from './context/ScegmanContext';
import { DashboardPage } from './pages/DashboardPage';
import { FaultsPage } from './pages/FaultsPage';
import { InventoryPage } from './pages/InventoryPage';
import { MachinesPage } from './pages/MachinesPage';
import { MessagesPage } from './pages/MessagesPage';
import { RepairsPage } from './pages/RepairsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SparePartsPage } from './pages/SparePartsPage';
import { TasksPage } from './pages/TasksPage';
import type { ModuleKey } from './types/scegman';

function ScegmanShell() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveModule} />;
      case 'fallas':
        return <FaultsPage onNavigate={setActiveModule} />;
      case 'maquinas':
        return <MachinesPage />;
      case 'informes':
        return <ReportsPage />;
      case 'repuestos':
        return <SparePartsPage />;
      case 'inventario':
        return <InventoryPage />;
      case 'tareas':
        return <TasksPage onNavigate={setActiveModule} />;
      case 'comunicacion':
        return <MessagesPage />;
      case 'historial':
        return <RepairsPage />;
      default:
        return <DashboardPage onNavigate={setActiveModule} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          activeModule={activeModule}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onNavigate={setActiveModule}
        />

        <main className="flex-1 p-4 sm:p-6">{renderModule()}</main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ScegmanProvider>
      <ScegmanShell />
    </ScegmanProvider>
  );
}

export default App;
