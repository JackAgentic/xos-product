import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSwipeable } from 'react-swipeable';
import { clientMenuItems, adviceMenuItems, allTabs } from '../data/menuData';
import { initialClientsData } from '../data/clientsInitialState';
import { ClientDetailHeader } from './ClientDetailHeader';
import { OverviewFloatingActions } from './OverviewFloatingActions';
import { OverviewView } from './OverviewView';
import { FactFindView } from './FactFindView';
import { FinancialsView } from './FinancialsView';
import { ContactsView } from './ContactsView';
import { MeetingsView } from './MeetingsView';
import { DocumentsView } from './DocumentsView';
import { CommunicationView } from './CommunicationView';
import { NotesView } from './NotesView';
import { KiwiSaverView } from './KiwiSaverView';
import { OpportunitiesView } from './OpportunitiesView';
import {
  Home as HomeIcon,
  Shield,
  MoreVertical,
  X,
} from 'lucide-react';

interface ClientDetailViewProps {
  selectedClientId: number | null;
  clients: typeof initialClientsData;
  onBackToList: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  isDesktop: boolean;
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
  setShowAIAssistantModal: (show: boolean) => void;
  showAddOpportunityModal: boolean;
  opportunityForm: { name: string; type: string; probability: string; notes: string };
  setOpportunityForm: React.Dispatch<React.SetStateAction<{ name: string; type: string; probability: string; notes: string }>>;
  allOpportunities: any[];
  addOpportunity: (formData: { name: string; type: string; probability: string; notes: string }) => void;
  updateOpportunity: (id: number, updates: any) => void;
  selectedOpportunityId: number | null;
  setSelectedOpportunityId: (id: number | null) => void;
  onClientClick: (id: number) => void;
}

export function ClientDetailView({
  selectedClientId,
  clients,
  onBackToList,
  setMobileDrawerOpen,
  isDesktop,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal,
  setShowAIAssistantModal,
  showAddOpportunityModal,
  opportunityForm,
  setOpportunityForm,
  allOpportunities,
  addOpportunity,
  updateOpportunity,
  selectedOpportunityId,
  setSelectedOpportunityId,
  onClientClick,
}: ClientDetailViewProps) {
  const [activeClientMenu, setActiveClientMenu] = useState('overview');
  const [previousClientMenu, setPreviousClientMenu] = useState('overview');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [selectedContact, setSelectedContact] = useState(0);
  const [selectedCommunication, setSelectedCommunication] = useState<number | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState(0);
  const [notesTab, setNotesTab] = useState('notes');
  const [isMobileClientDetailsOpen, setIsMobileClientDetailsOpen] = useState(false);
  const [visibleModules, setVisibleModules] = useState({
    factFind: true, aiSummary: true, details: true, quickStats: true,
    opportunities: true, activities: true, quickActions: true,
  });

  const modalSetters = {
    setShowAddEventModal, setShowSendEmailModal, setShowAddDocumentModal,
    setShowAddNoteModal, setShowAddTaskModal, setShowAddOpportunityModal,
    setShowAIAssistantModal,
  };

  const toggleModule = (moduleKey: string) => {
    setVisibleModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey as keyof typeof prev]
    }));
  };

  const changeTab = (newTab: string) => {
    const currentIndex = allTabs.indexOf(activeClientMenu);
    const newIndex = allTabs.indexOf(newTab);
    setPreviousClientMenu(activeClientMenu);
    setSlideDirection(newIndex > currentIndex ? 'left' : 'right');
    setActiveClientMenu(newTab);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = allTabs.indexOf(activeClientMenu);
      if (currentIndex < allTabs.length - 1) changeTab(allTabs[currentIndex + 1]);
      setDragOffset(0); setIsDragging(false);
    },
    onSwipedRight: () => {
      const currentIndex = allTabs.indexOf(activeClientMenu);
      if (currentIndex > 0) changeTab(allTabs[currentIndex - 1]);
      setDragOffset(0); setIsDragging(false);
    },
    onSwiping: (eventData) => {
      const currentIndex = allTabs.indexOf(activeClientMenu);
      const canGoNext = currentIndex < allTabs.length - 1;
      const canGoPrev = currentIndex > 0;
      let offset = eventData.deltaX;
      if (offset > 0 && !canGoPrev) offset = offset * 0.3;
      else if (offset < 0 && !canGoNext) offset = offset * 0.3;
      setDragOffset(offset); setIsDragging(true);
    },
    onTouchEndOrOnMouseUp: () => { setDragOffset(0); setIsDragging(false); },
    trackMouse: false, preventScrollOnSwipe: false, delta: 50
  });

  const selectedClient = clients.find(c => c.id === selectedClientId);
  if (!selectedClient) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Client not found</h2>
          <p className="text-gray-500">The selected client could not be found.</p>
          <button onClick={onBackToList} className="mt-4 px-4 py-2 bg-[#0B3D2E] text-white rounded-sm hover:bg-[#081C15]">
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const renderClientContent = () => {
    switch (activeClientMenu) {
      case 'overview':
        return <OverviewView visibleModules={visibleModules} changeTab={changeTab} selectedClient={selectedClient} />;
      case 'opportunities':
        return <OpportunitiesView clientId={selectedClientId as number} showAddOpportunityModal={showAddOpportunityModal} opportunityForm={opportunityForm} setOpportunityForm={setOpportunityForm} allOpportunities={allOpportunities} addOpportunity={addOpportunity} updateOpportunity={updateOpportunity} selectedOpportunityId={selectedOpportunityId} setSelectedOpportunityId={setSelectedOpportunityId} {...modalSetters} onClientClick={onClientClick} />;
      case 'fact-find':
        return <FactFindView {...modalSetters} />;
      case 'financials':
        return <FinancialsView {...modalSetters} />;
      case 'contacts':
        return <ContactsView selectedContact={selectedContact} setSelectedContact={setSelectedContact} {...modalSetters} />;
      case 'meetings':
        return <MeetingsView selectedMeeting={selectedMeeting} setSelectedMeeting={setSelectedMeeting} {...modalSetters} />;
      case 'documents':
        return <DocumentsView {...modalSetters} />;
      case 'communication':
        return <CommunicationView selectedCommunication={selectedCommunication} setSelectedCommunication={setSelectedCommunication} {...modalSetters} />;
      case 'notes':
        return <NotesView notesTab={notesTab} setNotesTab={setNotesTab} {...modalSetters} />;
      case 'mortgage':
        return (<div className="flex-1 flex items-center justify-center p-6 pb-24"><div className="text-center"><HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h2 className="text-2xl font-semibold mb-2">Mortgage</h2><p className="text-gray-500">Mortgage information coming soon</p></div></div>);
      case 'insurance':
        return (<div className="flex-1 flex items-center justify-center p-6 pb-24"><div className="text-center"><Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h2 className="text-2xl font-semibold mb-2">Insurance</h2><p className="text-gray-500">Insurance information coming soon</p></div></div>);
      case 'kiwisaver':
        return <KiwiSaverView clientId={selectedClientId as number} clientName={selectedClient?.name || 'Client'} contacts={[{ id: 0, name: 'A household Client', type: 'self', email: 'test@test.com' }, { id: 1, name: 'Another Client', type: 'primary_contact', email: 'another@test.com' }, { id: 2, name: 'Sarah Johnson', type: 'primary_contact', email: 'sarah@test.com' }, { id: 3, name: 'Mike Williams', type: 'primary_contact', email: 'mike@test.com' }, { id: 4, name: 'Emma Thompson', type: 'primary_contact', email: 'emma@test.com' }]} setMobileDrawerOpen={setMobileDrawerOpen} />;
      default:
        return <OverviewView visibleModules={visibleModules} changeTab={changeTab} selectedClient={selectedClient} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <ClientDetailHeader
        selectedClient={selectedClient}
        activeClientMenu={activeClientMenu}
        changeTab={changeTab}
        onBackToList={onBackToList}
        setMobileDrawerOpen={setMobileDrawerOpen}
        {...modalSetters}
      />

      {/* Mobile: Swipe Indicator Dots */}
      <div
        className="flex justify-center items-center gap-1.5 py-2 sm:hidden border-t border-gray-100"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const rect = e.currentTarget.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const dots = Array.from(e.currentTarget.children) as HTMLElement[];
          dots.forEach((dot, index) => {
            const dotRect = dot.getBoundingClientRect();
            const dotX = dotRect.left + dotRect.width / 2 - rect.left;
            const distance = Math.abs(x - dotX);
            const proximity = Math.max(0, 1 - distance / 100);
            const circle = dot.querySelector('div') as HTMLElement;
            if (circle) {
              const menuItems = [...clientMenuItems, ...adviceMenuItems];
              const isActive = activeClientMenu === menuItems[index].id;
              circle.style.transform = `scale(${isActive ? 1 : 1 + proximity * 0.8})`;
            }
          });
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          const rect = e.currentTarget.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const dots = Array.from(e.currentTarget.children) as HTMLElement[];
          let closestIndex = 0; let closestDistance = Infinity;
          dots.forEach((dot, index) => {
            const dotRect = dot.getBoundingClientRect();
            const dotX = dotRect.left + dotRect.width / 2 - rect.left;
            const distance = Math.abs(x - dotX);
            if (distance < closestDistance) { closestDistance = distance; closestIndex = index; }
            const proximity = Math.max(0, 1 - distance / 100);
            const circle = dot.querySelector('div') as HTMLElement;
            if (circle) {
              const menuItems = [...clientMenuItems, ...adviceMenuItems];
              const isActive = activeClientMenu === menuItems[index].id;
              circle.style.transform = `scale(${isActive ? 1 : 1 + proximity * 0.8})`;
            }
          });
          const menuItems = [...clientMenuItems, ...adviceMenuItems];
          if (menuItems[closestIndex]) changeTab(menuItems[closestIndex].id);
        }}
        onTouchEnd={(e) => {
          const dots = Array.from(e.currentTarget.children) as HTMLElement[];
          dots.forEach((dot) => {
            const circle = dot.querySelector('div') as HTMLElement;
            if (circle) circle.style.transform = 'scale(1)';
          });
        }}
      >
        {[...clientMenuItems, ...adviceMenuItems].map((item) => (
          <button key={item.id} onClick={() => changeTab(item.id)} className="p-1 transition-all" aria-label={`Go to ${item.label}`}>
            <div
              className={`rounded-full transition-all duration-200 ${activeClientMenu === item.id ? 'w-6 h-1.5 bg-[#0B3D2E]' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'}`}
              style={{ transformOrigin: 'center' }}
            />
          </button>
        ))}
      </div>

      {/* Opportunities Client Header - Mobile Only */}
      {activeClientMenu === 'opportunities' && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
              {selectedClient.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h2 className="font-semibold">{selectedClient.name}</h2>
              <p className="text-xs text-gray-500">Client Details</p>
            </div>
          </div>
          <button onClick={() => setIsMobileClientDetailsOpen(!isMobileClientDetailsOpen)} className="text-gray-400 hover:text-gray-600 p-2 relative">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Mobile Client Details Popover */}
      {isMobileClientDetailsOpen && activeClientMenu === 'opportunities' && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/20 z-30" onClick={() => setIsMobileClientDetailsOpen(false)} />
          <div className="lg:hidden fixed top-16 right-4 left-4 z-40 bg-white rounded-sm shadow-md border border-gray-200 p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Client Details</h3>
              <button onClick={() => setIsMobileClientDetailsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Email:</span><span className="font-medium">andrew@household.com</span></div>
              <div className="flex justify-between"><span className="text-gray-600">First Name:</span><span className="font-medium">Andrew</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Kiwisaver calc:</span><span className="font-medium">Calculated</span></div>
              <div className="flex justify-between"><span className="text-gray-600">CRM:</span><span className="font-medium">Active</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Name (IR):</span><span className="font-medium">Andrew Carter</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Date Birth:</span><span className="font-medium">15/03/1985</span></div>
            </div>
          </div>
        </>
      )}

      {/* Content Area - Scrollable */}
      <div className="flex-1 min-h-0">
        <div {...swipeHandlers} style={{ touchAction: 'pan-y', height: '100%' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeClientMenu}
              initial={isDesktop ? undefined : { x: slideDirection === 'left' ? '100%' : '-100%', opacity: 0 }}
              animate={isDesktop ? undefined : { x: isDragging ? dragOffset : 0, opacity: 1 }}
              exit={isDesktop ? undefined : { x: slideDirection === 'left' ? '-100%' : '100%', opacity: 0 }}
              transition={isDesktop ? { duration: 0 } : { type: 'tween', ease: isDragging ? 'linear' : 'easeInOut', duration: isDragging ? 0 : 0.3 }}
              style={{ willChange: 'transform', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {renderClientContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Overview Floating Action Buttons */}
      {activeClientMenu === 'overview' && (
        <OverviewFloatingActions
          visibleModules={visibleModules}
          toggleModule={toggleModule}
          {...modalSetters}
        />
      )}
    </div>
  );
}
