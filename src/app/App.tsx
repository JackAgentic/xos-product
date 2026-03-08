import image_23c8042e2a3d5a6b784a2b190a05b08f0fe4ae3d from 'figma:asset/23c8042e2a3d5a6b784a2b190a05b08f0fe4ae3d.png'
// CRM Application v1.0.1 - Refactored into components
import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { apiFetch } from './lib/api';
import { toast, Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { ClientDetailView } from './components/ClientDetailView';
import { ClientsListView } from './components/ClientsListView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { DashboardView } from './components/DashboardView';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { NewOpportunityModal } from './components/NewOpportunityModal';
import { AddOpportunityModal } from './components/AddOpportunityModal';
import { AddEventModal } from './components/AddEventModal';
import { SendEmailModal } from './components/SendEmailModal';
import { AddDocumentModal } from './components/AddDocumentModal';
import { AddNoteModal } from './components/AddNoteModal';
import { AddTaskModal } from './components/AddTaskModal';
import { AIDragProvider, type AIElementContext } from './components/AIDragToInspect';
import { mainMenuItems } from './data/menuData';
import { DEFAULT_DASHBOARD_CONFIG, DASHBOARD_CONFIG_VERSION, DEFAULT_DASHBOARD_DATA, DASHBOARD_DATA_VERSION, type DashboardConfig, type DashboardData } from './data/dashboardConfig';

function App() {
  // Navigation state
  const [activeMainMenu, setActiveMainMenu] = useState('dashboard');
  const [viewingClient, setViewingClient] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const changeClientTabRef = useRef<((tab: string) => void) | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Modal states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAIAssistantModal, setShowAIAssistantModal] = useState(false);
  const [showNewOpportunityModal, setShowNewOpportunityModal] = useState(false);
  const [showAddOpportunityModal, setShowAddOpportunityModal] = useState(false);
  const [aiElementContext, setAiElementContext] = useState<AIElementContext | undefined>(undefined);
  const [aiChatKey, setAiChatKey] = useState(0);

  // Opportunity state
  const [selectedOpportunityClient, setSelectedOpportunityClient] = useState<number | null>(null);
  const [selectedOpportunityType, setSelectedOpportunityType] = useState<string>('');
  const [opportunityForm, setOpportunityForm] = useState({
    name: '',
    type: '',
    probability: '',
    notes: ''
  });
  const [allOpportunities, setAllOpportunities] = useState<any[]>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);

  // Clients state
  const [clients, setClients] = useState<any[]>([]);

  // Dashboard config state (persisted to localStorage)
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(() => {
    try {
      const saved = localStorage.getItem('xos-dashboard-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === DASHBOARD_CONFIG_VERSION) return parsed;
      }
    } catch { /* fall through */ }
    return DEFAULT_DASHBOARD_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('xos-dashboard-config', JSON.stringify(dashboardConfig));
  }, [dashboardConfig]);

  // Dashboard data state (mutable, persisted to localStorage)
  const [dashboardData, setDashboardData] = useState<DashboardData>(() => {
    try {
      const saved = localStorage.getItem('xos-dashboard-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === DASHBOARD_DATA_VERSION) return parsed;
      }
    } catch { /* fall through */ }
    return DEFAULT_DASHBOARD_DATA;
  });

  useEffect(() => {
    localStorage.setItem('xos-dashboard-data', JSON.stringify(dashboardData));
  }, [dashboardData]);

  // Desktop breakpoint detection
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Fetch clients and opportunities from API
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    apiFetch<any[]>('/api/clients').then(setClients).catch(() => {});
    apiFetch<any[]>('/api/opportunities').then(setAllOpportunities).catch(() => {});
  }, [isAuthenticated]);

  // Add new opportunity
  const addOpportunity = async (formData: typeof opportunityForm) => {
    if (!selectedClientId) return;
    const client = clients.find((c: any) => c.id === selectedClientId);
    if (!client) return;

    try {
      const newOpp = await apiFetch<any>('/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          clientId: selectedClientId,
          stage: 'Prospect',
          value: 0,
          probability: parseInt(formData.probability) || 0,
          type: formData.type,
          description: formData.notes || 'New opportunity created.',
        }),
      });

      setAllOpportunities(prev => [...prev, { ...newOpp, client: client.name }]);

      toast.success(`Opportunity "${formData.name}" created successfully`, {
        description: `${formData.type} opportunity added for ${client.name}`,
        duration: 4000,
        action: {
          label: 'View',
          onClick: () => setSelectedOpportunityId(newOpp.id),
        },
      });

      setShowAddOpportunityModal(false);
      setOpportunityForm({ name: '', type: '', probability: '', notes: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create opportunity');
    }
  };

  // Update existing opportunity
  const updateOpportunity = (id: number, updates: any) => {
    setAllOpportunities(prev => prev.map(opp =>
      opp.id === id ? { ...opp, ...updates } : opp
    ));
    apiFetch(`/api/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const handleMainMenuClick = (menuId: string) => {
    setActiveMainMenu(menuId);
    setViewingClient(false);
    if (menuId !== 'clients') setSelectedClientId(null);
  };

  const handleClientClick = (clientId: number) => {
    setSelectedClientId(clientId);
    setViewingClient(true);
  };

  const handleOpenAI = useCallback((elementContext?: AIElementContext) => {
    if (elementContext) {
      // Drag-to-inspect: reset chat by changing the key
      setAiChatKey(prev => prev + 1);
    }
    setAiElementContext(elementContext);
    setShowAIAssistantModal(true);
  }, []);

  const modalSetters = {
    setShowAddEventModal,
    setShowSendEmailModal,
    setShowAddDocumentModal,
    setShowAddNoteModal,
    setShowAddTaskModal,
    setShowAddOpportunityModal,
  };

  const renderMainContent = () => {
    if (activeMainMenu === 'clients' && !viewingClient) {
      return (
        <ClientsListView
          onClientClick={handleClientClick}
          setMobileDrawerOpen={setMobileDrawerOpen}
          showNewOpportunityModal={showNewOpportunityModal}
          setShowNewOpportunityModal={setShowNewOpportunityModal}
          selectedOpportunityClient={selectedOpportunityClient}
          setSelectedOpportunityClient={setSelectedOpportunityClient}
          selectedOpportunityType={selectedOpportunityType}
          setSelectedOpportunityType={setSelectedOpportunityType}
          clients={clients}
          setClients={setClients}
        />
      );
    }

    if (activeMainMenu === 'clients' && viewingClient) {
      return (
        <ClientDetailView
          selectedClientId={selectedClientId}
          clients={clients}
          onBackToList={() => setViewingClient(false)}
          setMobileDrawerOpen={setMobileDrawerOpen}
          isDesktop={isDesktop}
          {...modalSetters}
          showAddOpportunityModal={showAddOpportunityModal}
          opportunityForm={opportunityForm}
          setOpportunityForm={setOpportunityForm}
          allOpportunities={allOpportunities}
          addOpportunity={addOpportunity}
          updateOpportunity={updateOpportunity}
          selectedOpportunityId={selectedOpportunityId}
          setSelectedOpportunityId={setSelectedOpportunityId}
          onClientClick={handleClientClick}
          onRegisterTabNav={(fn) => { changeClientTabRef.current = fn; }}
        />
      );
    }

    if (activeMainMenu === 'opportunities') {
      return (
        <OpportunitiesView
          clientId={null}
          showAddOpportunityModal={showAddOpportunityModal}
          opportunityForm={opportunityForm}
          setOpportunityForm={setOpportunityForm}
          allOpportunities={allOpportunities}
          addOpportunity={addOpportunity}
          updateOpportunity={updateOpportunity}
          selectedOpportunityId={selectedOpportunityId}
          setSelectedOpportunityId={setSelectedOpportunityId}
          {...modalSetters}
          onClientClick={handleClientClick}
        />
      );
    }

    if (activeMainMenu === 'dashboard') {
      return (
        <DashboardView
          setMobileDrawerOpen={setMobileDrawerOpen}
          clients={clients}
          allOpportunities={allOpportunities}
          handleClientClick={handleClientClick}
          dashboardConfig={dashboardConfig}
          onConfigChange={setDashboardConfig}
          dashboardData={dashboardData}
          onDataChange={setDashboardData}
        />
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">{mainMenuItems.find(item => item.id === activeMainMenu)?.label}</h2>
          <p className="text-gray-500">Content for this section coming soon</p>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[radial-gradient(ellipse_1200px_1200px_at_top_left,_#2D6A4F_0%,_#081C15_45%,_#040E0A_100%)]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AIDragProvider onOpenAI={handleOpenAI} showButton={true} isDrawerOpen={showAIAssistantModal}>
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeMainMenu={activeMainMenu}
        onMenuClick={handleMainMenuClick}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileDrawerOpen={mobileDrawerOpen}
        onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
        {renderMainContent()}
      </div>

      {/* Quick Action Modals */}
      <AddEventModal isOpen={showAddEventModal} onClose={() => setShowAddEventModal(false)} clientId={selectedClientId} />
      <SendEmailModal isOpen={showSendEmailModal} onClose={() => setShowSendEmailModal(false)} clientId={selectedClientId} />
      <AddDocumentModal isOpen={showAddDocumentModal} onClose={() => setShowAddDocumentModal(false)} clientId={selectedClientId} />
      <AddNoteModal isOpen={showAddNoteModal} onClose={() => setShowAddNoteModal(false)} clientId={selectedClientId} />
      <AddTaskModal isOpen={showAddTaskModal} onClose={() => setShowAddTaskModal(false)} clientId={selectedClientId} />

      {/* New Opportunity Modal (from client list) */}
      <NewOpportunityModal
        isOpen={showNewOpportunityModal}
        onClose={() => setShowNewOpportunityModal(false)}
        opportunityType={selectedOpportunityType}
      />

      {/* Add Opportunity Modal (from quick actions) */}
      <AddOpportunityModal
        isOpen={showAddOpportunityModal}
        onClose={() => setShowAddOpportunityModal(false)}
        opportunityForm={opportunityForm}
        setOpportunityForm={setOpportunityForm}
        onSubmit={addOpportunity}
      />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        key={aiChatKey}
        isOpen={showAIAssistantModal}
        onClose={() => {
          setShowAIAssistantModal(false);
          setAiElementContext(undefined);
        }}
        elementContext={aiElementContext}
        dashboardConfig={dashboardConfig}
        onDashboardConfigChange={setDashboardConfig}
        dashboardData={dashboardData}
        onDashboardDataChange={setDashboardData}
        activeView={activeMainMenu}
        clientName={selectedClientId ? clients.find(c => c.id === selectedClientId)?.name : undefined}
        selectedClient={selectedClientId ? clients.find(c => c.id === selectedClientId) : undefined}
        allClients={clients}
        allOpportunities={allOpportunities}
        onNavigateTab={(tab) => changeClientTabRef.current?.(tab)}
        onClientClick={handleClientClick}
        onAction={(action) => {
          const setters: Record<string, (v: boolean) => void> = {
            'add-event': setShowAddEventModal,
            'send-email': setShowSendEmailModal,
            'add-document': setShowAddDocumentModal,
            'add-note': setShowAddNoteModal,
            'add-task': setShowAddTaskModal,
            'add-opportunity': setShowAddOpportunityModal,
          };
          setters[action]?.(true);
        }}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'white', color: '#1a1f2e', border: '1px solid #e5e7eb' },
          success: { iconTheme: { primary: '#0B3D2E', secondary: 'white' } },
        }}
      />
    </div>
    </AIDragProvider>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
