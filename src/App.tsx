import React, { useState } from 'react';
import { AppShell, AppPage } from './components/layout/AppShell';
import { OverviewView } from './views/OverviewView';
import { TopologyView } from './views/TopologyView';
import { ActiveIncidentsView } from './views/ActiveIncidentsView';
import { RootCauseView } from './views/RootCauseView';
import { SimulationView } from './views/SimulationView';
import { PredictionsView } from './views/PredictionsView';
import { ServicesView } from './views/ServicesView';
import { IncidentHistoryView } from './views/IncidentHistoryView';
import { MetricsView } from './views/MetricsView';
import { LogsView } from './views/LogsView';
import { TracesView } from './views/TracesView';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewView onNavigate={setCurrentPage} />;
      case 'topology':
        return <TopologyView onNavigate={setCurrentPage} />;
      case 'services':
        return <ServicesView onNavigate={setCurrentPage} />;
      case 'active-incidents':
        return <ActiveIncidentsView onNavigate={setCurrentPage} />;
      case 'root-cause':
        return <RootCauseView onNavigate={setCurrentPage} />;
      case 'simulation':
        return <SimulationView onNavigate={setCurrentPage} />;
      case 'predictions':
        return <PredictionsView onNavigate={setCurrentPage} />;
      case 'incident-history':
        return <IncidentHistoryView onNavigate={setCurrentPage} />;
      case 'metrics':
        return <MetricsView onNavigate={setCurrentPage} />;
      case 'logs':
        return <LogsView onNavigate={setCurrentPage} />;
      case 'traces':
        return <TracesView onNavigate={setCurrentPage} />;
      default:
        return <OverviewView onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppShell>
  );
}
