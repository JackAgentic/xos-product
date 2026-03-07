import image_23c8042e2a3d5a6b784a2b190a05b08f0fe4ae3d from 'figma:asset/23c8042e2a3d5a6b784a2b190a05b08f0fe4ae3d.png'
// CRM Application v1.0.1 - Refactored into components
import { useState, useEffect, useCallback } from 'react';
import { CLIENTS_LOOKUP } from './data/clients';
import { generateOpportunities } from './data/opportunities';
import { initialClientsData } from './data/clientsInitialState';
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
import { DEFAULT_DASHBOARD_CONFIG, type DashboardConfig } from './data/dashboardConfig';

function App() {
  // Navigation state
  const [activeMainMenu, setActiveMainMenu] = useState('clients');
  const [viewingClient, setViewingClient] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
  const [allOpportunities, setAllOpportunities] = useState(() => generateOpportunities());
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);

  // Clients state
  const [clients, setClients] = useState(initialClientsData);

  // Dashboard config state (persisted to localStorage)
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(() => {
    try {
      const saved = localStorage.getItem('xos-dashboard-config');
      return saved ? JSON.parse(saved) : DEFAULT_DASHBOARD_CONFIG;
    } catch {
      return DEFAULT_DASHBOARD_CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem('xos-dashboard-config', JSON.stringify(dashboardConfig));
  }, [dashboardConfig]);

  // Desktop breakpoint detection
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Add new opportunity
  const addOpportunity = (formData: typeof opportunityForm) => {
    if (!selectedClientId) return;
    const client = CLIENTS_LOOKUP.find(c => c.id === selectedClientId);
    if (!client) return;

    const newOpportunity = {
      id: allOpportunities.length + 1,
      name: formData.name,
      clientId: selectedClientId,
      client: client.name,
      advisor: 'John Smith',
      clientDetails: {
        email: client.email,
        firstName: client.name.split(' ')[0],
        kiwisaverCalc: 'Not set',
        crm: 'Active',
        nameIR: client.name,
        dateOfBirth: '01/01/1990'
      },
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      stage: 'Prospect',
      value: '$0',
      probability: parseInt(formData.probability) || 0,
      type: formData.type,
      description: formData.notes || 'New opportunity created.',
      notes: formData.notes ? [formData.notes] : []
    };

    setAllOpportunities(prev => [...prev, newOpportunity]);

    toast.success(`Opportunity "${formData.name}" created successfully`, {
      description: `${formData.type} opportunity added for ${client.name}`,
      duration: 4000,
      action: {
        label: 'View',
        onClick: () => {
          setSelectedOpportunityId(newOpportunity.id);
        }
      },
    });

    setShowAddOpportunityModal(false);
    setOpportunityForm({ name: '', type: '', probability: '', notes: '' });
  };

  // Update existing opportunity
  const updateOpportunity = (id: number, updates: any) => {
    setAllOpportunities(prev => prev.map(opp =>
      opp.id === id ? { ...opp, ...updates } : opp
    ));
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
      <AddEventModal isOpen={showAddEventModal} onClose={() => setShowAddEventModal(false)} />
      <SendEmailModal isOpen={showSendEmailModal} onClose={() => setShowSendEmailModal(false)} />
      <AddDocumentModal isOpen={showAddDocumentModal} onClose={() => setShowAddDocumentModal(false)} />
      <AddNoteModal isOpen={showAddNoteModal} onClose={() => setShowAddNoteModal(false)} />
      <AddTaskModal isOpen={showAddTaskModal} onClose={() => setShowAddTaskModal(false)} />

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
        activeView={activeMainMenu}
        clientName={selectedClientId ? clients.find(c => c.id === selectedClientId)?.name : undefined}
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

export default App;
