import { useState, useRef, useEffect } from 'react';
import { Users, Building, Search, Plus, Filter, X, Phone, Mail, Smartphone, UserCircle, ChevronRight, ChevronsUpDown, Columns, Menu } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { adviceLabels, getAdviceIcon } from '../utils/adviceUtils';
import { initialClientsData } from '../data/clientsInitialState';
import { ClientFilterModal } from './ClientFilterModal';
import { AddClientModal } from './AddClientModal';

interface ClientsListViewProps {
  onClientClick: (clientId: number) => void;
  setMobileDrawerOpen: (open: boolean) => void;
  showNewOpportunityModal: boolean;
  setShowNewOpportunityModal: (show: boolean) => void;
  selectedOpportunityClient: number | null;
  setSelectedOpportunityClient: (id: number | null) => void;
  selectedOpportunityType: string;
  setSelectedOpportunityType: (type: string) => void;
  clients: typeof initialClientsData;
  setClients: React.Dispatch<React.SetStateAction<typeof initialClientsData>>;
}

export function ClientsListView({
  onClientClick, setMobileDrawerOpen, showNewOpportunityModal, setShowNewOpportunityModal,
  selectedOpportunityClient, setSelectedOpportunityClient, selectedOpportunityType,
  setSelectedOpportunityType, clients, setClients,
}: ClientsListViewProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalAnimating, setSearchModalAnimating] = useState(true);
  const [selectedManager, setSelectedManager] = useState('All Managers');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showAdviceFilter, setShowAdviceFilter] = useState(false);
  const [showManagerFilter, setShowManagerFilter] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({ client: true, status: true, advice: true, manager: true, contact: true });
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const [newClientForm, setNewClientForm] = useState({
    entityType: 'Individual', clientName: '', email: '', phoneCountry: 'NZ +64', phone: '',
    primaryContact: { name: '', email: '', phoneCountry: 'NZ +64', phone: '', relationship: '' },
    productTypes: [] as string[], clientAdvisor: '', notes: '',
  });

  const mapProductTypesToAdvice = (productTypes: string[]): string[] => {
    const mapping: { [key: string]: string } = { KIWISAVER: 'K', INSURANCE: 'I', MORTGAGE: 'M', INVESTMENT: 'V', REVIEW: 'R' };
    return productTypes.map((p) => mapping[p]).filter(Boolean);
  };

  const handleCloseSearchModal = () => {
    setSearchModalAnimating(true);
    setTimeout(() => {
      setShowSearchModal(false);
      setTimeout(() => setSearchModalAnimating(true), 0);
    }, 700);
  };

  useEffect(() => {
    if (showSearchModal) {
      setSearchModalAnimating(true);
      requestAnimationFrame(() => { requestAnimationFrame(() => { setSearchModalAnimating(false); }); });
    }
  }, [showSearchModal]);

  useEffect(() => {
    const headerScroll = headerScrollRef.current;
    const bodyScroll = bodyScrollRef.current;
    if (!headerScroll || !bodyScroll) return;
    const syncHeaderScroll = (e: Event) => { if (headerScroll) headerScroll.scrollLeft = (e.target as HTMLElement).scrollLeft; };
    const syncBodyScroll = (e: Event) => { if (bodyScroll) bodyScroll.scrollLeft = (e.target as HTMLElement).scrollLeft; };
    bodyScroll.addEventListener('scroll', syncHeaderScroll);
    headerScroll.addEventListener('scroll', syncBodyScroll);
    return () => { bodyScroll.removeEventListener('scroll', syncHeaderScroll); headerScroll.removeEventListener('scroll', syncBodyScroll); };
  }, []);

  const handleAddClient = () => {
    if (!newClientForm.clientName.trim()) { alert('Please enter a client/entity name'); return; }
    if (newClientForm.entityType !== 'Individual' && !newClientForm.primaryContact.name.trim()) { alert('Please enter a primary contact name'); return; }
    let email = '\u2014';
    let phone = '\u2014';
    if (newClientForm.entityType === 'Individual') {
      email = newClientForm.email || '\u2014';
      phone = newClientForm.phone ? `${newClientForm.phoneCountry.split('+')[1]} ${newClientForm.phone}` : '\u2014';
    } else {
      email = newClientForm.primaryContact.email || '\u2014';
      phone = newClientForm.primaryContact.phone ? `${newClientForm.primaryContact.phoneCountry.split('+')[1]} ${newClientForm.primaryContact.phone}` : '\u2014';
    }
    const newClient = {
      id: Math.max(...clients.map((c) => c.id)) + 1,
      name: newClientForm.clientName,
      type: newClientForm.entityType === 'Individual' ? 'person' : 'building',
      status: 'PROSPECT' as const,
      advice: mapProductTypesToAdvice(newClientForm.productTypes),
      managers: newClientForm.clientAdvisor ? [{ name: newClientForm.clientAdvisor, initials: newClientForm.clientAdvisor.split(' ').map((n) => n[0]).join('').toUpperCase() }] : [],
      email, phone,
    };
    setClients([newClient, ...clients]);
    setShowAddClientModal(false);
    setNewClientForm({
      entityType: 'Individual', clientName: '', email: '', phoneCountry: 'NZ +64', phone: '',
      primaryContact: { name: '', email: '', phoneCountry: 'NZ +64', phone: '', relationship: '' },
      productTypes: [], clientAdvisor: '', notes: '',
    });
  };

  const managers = Array.from(new Set(clients.flatMap((c) => c.managers.map((m) => m.name))));
  const statuses = Array.from(new Set(clients.map((c) => c.status)));

  const filteredClients = clients.filter((client) => {
    if (searchQuery && !client.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(client.status)) return false;
    if (activeFilter !== 'All' && !client.advice.includes(activeFilter)) return false;
    if (selectedManager !== 'All Managers' && !client.managers.some((m) => m.name === selectedManager)) return false;
    return true;
  });

  const renderAdviceCells = (client: typeof filteredClients[0], isMobile: boolean) => (
    ['M', 'K', 'I', 'V', 'R'].map((letter) => {
      const adviceData = client.adviceProgress?.[letter];
      const isActive = adviceData?.active || client.advice.includes(letter);
      const progress = adviceData?.progress || 0;
      const stage = adviceData?.stage;
      if (isMobile) {
        if (!isActive) return null;
        return (
          <Tooltip key={letter}>
            <TooltipTrigger asChild>
              <div className="relative w-8 h-8 flex items-center justify-center rounded transition-all overflow-hidden bg-gray-100 border border-transparent">
                <span className="text-sm relative z-10 text-emerald-900">{getAdviceIcon(letter)}</span><div className="absolute bottom-0 left-0 w-full bg-emerald-900 opacity-10 pointer-events-none" style={{ height: `${Math.max(progress, 15)}%` }} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={10}>
              {stage ? `${adviceLabels[letter]} - ${stage}` : adviceLabels[letter]}
            </TooltipContent>
          </Tooltip>
        );
      }
      return (
        <Tooltip key={letter}>
          <TooltipTrigger asChild>
            <button onClick={(e) => { e.stopPropagation(); if (!isActive) { setSelectedOpportunityClient(client.id); setSelectedOpportunityType(letter); setShowNewOpportunityModal(true); } }}
              className={`group/advice relative w-8 h-8 flex items-center justify-center rounded transition-all overflow-hidden ${isActive ? 'text-white border border-transparent' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 text-gray-300 hover:text-gray-400 hover:border hover:border-emerald-900 hover:bg-transparent'}`}
            >
              {isActive && (<><span className="relative z-10 text-emerald-900">{getAdviceIcon(letter)}</span><div className="absolute bottom-0 left-0 w-full bg-emerald-700 opacity-20 pointer-events-none" style={{ height: `${Math.max(progress, 15)}%` }} /></>)}
              {!isActive && (<><span className="group-hover/advice:hidden">{getAdviceIcon(letter)}</span><Plus className="hidden group-hover/advice:block w-4 h-4 text-emerald-900" /></>)}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={10}>
            {isActive && stage ? `${adviceLabels[letter]} - ${stage}` : adviceLabels[letter]}
          </TooltipContent>
        </Tooltip>
      );
    })
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 sm:p-4">
          <div className="flex items-center gap-3 [@media(max-width:390px)]:flex-wrap">
            <button onClick={() => setMobileDrawerOpen(true)} className="h-10 w-10 hover:bg-gray-100 rounded-sm lg:hidden flex-shrink-0 flex items-center justify-center">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => { }} className="flex-shrink-0 lg:hidden h-10 flex items-center px-3 py-2 rounded-full bg-stone-200/50">
              <svg width="25" height="9" viewBox="0 0 25 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto">
                <path d="M23.9311 8.65188C23.6031 8.65188 23.3591 8.57188 23.1991 8.41188C23.0471 8.24388 22.9711 8.03188 22.9711 7.77588V7.55988C22.9711 7.30388 23.0471 7.09188 23.1991 6.92388C23.3591 6.75588 23.6031 6.67188 23.9311 6.67188C24.2671 6.67188 24.5111 6.75588 24.6631 6.92388C24.8151 7.09188 24.8911 7.30388 24.8911 7.55988V7.77588C24.8911 8.03188 24.8151 8.24388 24.6631 8.41188C24.5111 8.57188 24.2671 8.65188 23.9311 8.65188Z" fill="#0B3D2E" />
                <path d="M18.3951 8.664C17.6751 8.664 17.0631 8.536 16.5591 8.28C16.0631 8.024 15.6351 7.688 15.2751 7.272L16.3431 6.24C16.6311 6.576 16.9511 6.832 17.3031 7.008C17.6631 7.184 18.0591 7.272 18.4911 7.272C18.9791 7.272 19.3471 7.168 19.5951 6.96C19.8431 6.744 19.9671 6.456 19.9671 6.096C19.9671 5.816 19.8871 5.588 19.7271 5.412C19.5671 5.236 19.2671 5.108 18.8271 5.028L18.0351 4.908C16.3631 4.644 15.5271 3.832 15.5271 2.472C15.5271 2.096 15.5951 1.756 15.7311 1.452C15.8751 1.148 16.0791 0.888 16.3431 0.672C16.6071 0.456 16.9231 0.292 17.2911 0.18C17.6671 0.0599999 18.0911 0 18.5631 0C19.1951 0 19.7471 0.104 20.2191 0.312C20.6911 0.52 21.0951 0.828 21.4311 1.236L20.3511 2.256C20.1431 2 19.8911 1.792 19.5951 1.632C19.2991 1.472 18.9271 1.392 18.4791 1.392C18.0231 1.392 17.6791 1.48 17.4471 1.656C17.2231 1.824 17.1111 2.064 17.1111 2.376C17.1111 2.696 17.2031 2.932 17.3871 3.084C17.5711 3.236 17.8671 3.348 18.2751 3.42L19.0551 3.564C19.9031 3.716 20.5271 3.988 20.9271 4.38C21.3351 4.764 21.5391 5.304 21.5391 6C21.5391 6.4 21.4671 6.764 21.3231 7.092C21.1871 7.412 20.9831 7.692 20.7111 7.932C20.4471 8.164 20.1191 8.344 19.7271 8.472C19.3431 8.6 18.8991 8.664 18.3951 8.664Z" fill="#081C15" />
                <path d="M10.5713 8.664C10.0193 8.664 9.51934 8.572 9.07134 8.388C8.62334 8.204 8.23934 7.928 7.91934 7.56C7.60734 7.192 7.36334 6.74 7.18734 6.204C7.01134 5.668 6.92334 5.044 6.92334 4.332C6.92334 3.628 7.01134 3.008 7.18734 2.472C7.36334 1.928 7.60734 1.472 7.91934 1.104C8.23934 0.736 8.62334 0.46 9.07134 0.276C9.51934 0.092 10.0193 0 10.5713 0C11.1233 0 11.6233 0.092 12.0713 0.276C12.5193 0.46 12.9033 0.736 13.2233 1.104C13.5433 1.472 13.7873 1.928 13.9553 2.472C14.1313 3.008 14.2193 3.628 14.2193 4.332C14.2193 5.044 14.1313 5.668 13.9553 6.204C13.7873 6.74 13.5433 7.192 13.2233 7.56C12.9033 7.928 12.5193 8.204 12.0713 8.388C11.6233 8.572 11.1233 8.664 10.5713 8.664ZM10.5713 7.26C11.1713 7.26 11.6473 7.06 11.9993 6.66C12.3593 6.26 12.5393 5.7 12.5393 4.98V3.684C12.5393 2.964 12.3593 2.404 11.9993 2.004C11.6473 1.604 11.1713 1.404 10.5713 1.404C9.97134 1.404 9.49134 1.604 9.13134 2.004C8.77934 2.404 8.60334 2.964 8.60334 3.684V4.98C8.60334 5.7 8.77934 6.26 9.13134 6.66C9.49134 7.06 9.97134 7.26 10.5713 7.26Z" fill="#081C15" />
                <path d="M0 8.51986L2.136 5.33986L0.048 2.25586H1.8L3.096 4.33186H3.144L4.428 2.25586H6.06L3.936 5.36386L6.072 8.51986H4.32L3 6.35986H2.952L1.632 8.51986H0Z" fill="#081C15" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold flex-shrink-0">Clients</h1>
            <div className="flex items-center gap-2 flex-1 justify-end [@media(max-width:390px)]:basis-full">
              <>
                <button onClick={() => setShowSearchModal(true)} className="h-10 w-10 border border-gray-200 rounded-sm text-emerald-950 hover:bg-gray-50 flex items-center justify-center [@media(min-width:500px)]:hidden">
                  <Search className="w-4 h-4" />
                </button>
                <div className="hidden [@media(min-width:500px)]:flex relative flex-1 max-w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type="text" placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-10 border border-gray-200 rounded-sm text-sm" />
                  {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>)}
                </div>
              </>
              <div className="hidden lg:block relative">
                <button onClick={() => setShowColumnsMenu(!showColumnsMenu)} className="h-10 w-10 border border-gray-200 rounded-sm text-emerald-950 hover:bg-gray-50 flex items-center justify-center"><Columns className="w-4 h-4" /></button>
                {showColumnsMenu && (<>
                  <div className="fixed inset-0 z-10" onClick={() => setShowColumnsMenu(false)} />
                  <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-sm shadow-lg py-2 min-w-[180px] z-20">
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase">Show Columns</div>
                    {Object.entries(visibleColumns).map(([key, value]) => (
                      <button key={key} onClick={() => setVisibleColumns((prev) => ({ ...prev, [key]: !value }))} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${value ? 'bg-emerald-900 border-emerald-900' : 'border-gray-300'}`}>{value && <div className="w-2 h-2 bg-white rounded-sm" />}</div>
                        <span className="text-gray-700 capitalize">{key}</span>
                      </button>
                    ))}
                  </div>
                </>)}
              </div>
              <button onClick={() => setShowFilterModal(true)} className="lg:hidden h-10 w-10 border border-gray-200 rounded-sm text-emerald-950 hover:bg-gray-50 relative flex items-center justify-center">
                <Filter className="w-4 h-4" />
                {(activeFilter !== 'All' || selectedManager !== 'All Managers' || selectedStatuses.length > 0) && (<span className="absolute top-1 right-1 w-2 h-2 bg-emerald-900 rounded-full"></span>)}
              </button>
              <button onClick={() => setShowAddClientModal(true)} className="h-9 px-3 bg-emerald-700 text-white text-sm font-medium rounded-sm hover:bg-emerald-800 flex items-center gap-2 flex-shrink-0">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden bg-white flex flex-col">
          {/* Desktop Table View */}
          <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
            <div ref={headerScrollRef} className="overflow-x-auto flex-shrink-0">
              <table className="w-full" style={{ minWidth: '1000px' }}>
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    {visibleColumns.client && (<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 truncate" style={{ width: '250px', minWidth: '250px' }}>Client</th>)}
                    {visibleColumns.status && (<th className="px-4 py-3 text-left truncate" style={{ width: '180px', minWidth: '180px' }}>
                      <div className="relative inline-block">
                        <button onClick={() => setShowStatusFilter(!showStatusFilter)} className={`flex items-center gap-2 text-sm font-medium hover:text-gray-700 ${selectedStatuses.length > 0 ? 'text-emerald-900' : 'text-gray-500'}`}>Status<ChevronsUpDown className="w-4 h-4" /></button>
                        {showStatusFilter && (<>
                          <div className="fixed inset-0 z-20" onClick={() => setShowStatusFilter(false)} />
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg py-2 min-w-[160px] z-30">
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-200 mb-1">Filter by Status</div>
                            {statuses.map((status) => (
                              <button key={status} onClick={() => setSelectedStatuses((prev) => prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status])} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedStatuses.includes(status) ? 'bg-emerald-900 border-emerald-900' : 'border-gray-300'}`}>{selectedStatuses.includes(status) && <div className="w-2 h-2 bg-white rounded-sm" />}</div>
                                <span className="text-gray-700">{status}</span>
                              </button>
                            ))}
                            {selectedStatuses.length > 0 && (<><div className="border-t border-gray-200 my-1" /><button onClick={() => setSelectedStatuses([])} className="w-full text-left px-4 py-2 text-sm text-emerald-900 hover:bg-gray-50">Clear filter</button></>)}
                          </div>
                        </>)}
                      </div>
                    </th>)}
                    {visibleColumns.advice && (<th className="px-4 py-3 text-left truncate" style={{ width: '220px', minWidth: '220px' }}>
                      <div className="relative inline-block">
                        <button onClick={() => setShowAdviceFilter(!showAdviceFilter)} className={`flex items-center gap-2 text-sm font-medium hover:text-gray-700 ${activeFilter !== 'All' ? 'text-emerald-900' : 'text-gray-500'}`}>Advice<ChevronsUpDown className="w-4 h-4" /></button>
                        {showAdviceFilter && (<>
                          <div className="fixed inset-0 z-20" onClick={() => setShowAdviceFilter(false)} />
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg py-2 min-w-[180px] z-30">
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-200 mb-1">Filter by Advice Type</div>
                            <button onClick={() => { setActiveFilter('All'); setShowAdviceFilter(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${activeFilter === 'All' ? 'bg-emerald-900/10 text-emerald-900' : 'text-gray-700'}`}>All</button>
                            {['M', 'K', 'I', 'V', 'R'].map((letter) => (
                              <button key={letter} onClick={() => { setActiveFilter(letter); setShowAdviceFilter(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${activeFilter === letter ? 'bg-emerald-900/10 text-emerald-900' : 'text-gray-700'}`}>
                                <span className="w-5 h-5 text-gray-400 flex items-center justify-center">{getAdviceIcon(letter)}</span>{adviceLabels[letter]}
                              </button>
                            ))}
                          </div>
                        </>)}
                      </div>
                    </th>)}
                    {visibleColumns.manager && (<th className="px-4 py-3 text-left truncate" style={{ width: '220px', minWidth: '220px' }}>
                      <div className="relative inline-block">
                        <button onClick={() => setShowManagerFilter(!showManagerFilter)} className={`flex items-center gap-2 text-sm font-medium hover:text-gray-700 ${selectedManager !== 'All Managers' ? 'text-emerald-900' : 'text-gray-500'}`}>Client Manager<ChevronsUpDown className="w-4 h-4" /></button>
                        {showManagerFilter && (<>
                          <div className="fixed inset-0 z-20" onClick={() => setShowManagerFilter(false)} />
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg py-2 min-w-[200px] z-30">
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-200 mb-1">Filter by Manager</div>
                            <button onClick={() => { setSelectedManager('All Managers'); setShowManagerFilter(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedManager === 'All Managers' ? 'bg-emerald-900/10 text-emerald-900' : 'text-gray-700'}`}>All Managers</button>
                            {managers.map((manager) => (
                              <button key={manager} onClick={() => { setSelectedManager(manager); setShowManagerFilter(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedManager === manager ? 'bg-emerald-900/10 text-emerald-900' : 'text-gray-700'}`}>{manager}</button>
                            ))}
                          </div>
                        </>)}
                      </div>
                    </th>)}
                    {visibleColumns.contact && (<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 truncate" style={{ width: '280px', minWidth: '280px' }}>Contact Details</th>)}
                    <th className="px-4 py-3" style={{ width: '60px', minWidth: '60px' }}></th>
                  </tr>
                </thead>
              </table>
            </div>
            <div ref={bodyScrollRef} className="overflow-auto flex-1">
              <table className="w-full" style={{ minWidth: '1000px' }}>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} onClick={() => onClientClick(client.id)} className="hover:bg-gray-50 cursor-pointer group overflow-visible">
                      {visibleColumns.client && (<td className="px-4 py-3" style={{ width: '250px', minWidth: '250px' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-emerald-900 transition-colors">
                            {client.type === 'person' ? <Users className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                          </div>
                          <span className="text-sm font-medium truncate text-gray-700 group-hover:text-gray-900 transition-colors">{client.name}</span>
                        </div>
                      </td>)}
                      {visibleColumns.status && (<td className="px-4 py-3" style={{ width: '180px', minWidth: '180px' }}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${client.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-400 group-hover:animate-pulse'}`} />
                          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">{client.status}</span>
                        </div>
                      </td>)}
                      {visibleColumns.advice && (<td className="px-4 py-3" style={{ width: '220px', minWidth: '220px' }}><div className="flex items-center gap-2">{renderAdviceCells(client, false)}</div></td>)}
                      {visibleColumns.manager && (<td className="px-4 py-3 overflow-visible" style={{ width: '220px', minWidth: '220px' }}>
                        {client.managers.length > 0 ? (
                          <div className="flex items-center -space-x-2 relative">
                            {client.managers.slice(0, 3).map((manager, index) => (
                              <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                  <div className="w-8 h-8 rounded-full bg-white text-emerald-900 flex items-center justify-center text-xs font-medium border border-emerald-900 hover:z-10 transition-transform hover:scale-110 relative cursor-pointer">
                                    {manager.initials}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={10}>
                                  {manager.name}
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            {client.managers.length > 3 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-medium border-2 border-white relative cursor-pointer">
                                    +{client.managers.length - 3}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={10}>
                                  {client.managers.slice(3).map((m) => m.name).join(', ')}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        ) : (<span className="text-gray-300 font-medium">—</span>)}
                      </td>)}
                      {visibleColumns.contact && (<td className="px-4 py-3" style={{ width: '280px', minWidth: '280px' }}>
                        <div className="flex flex-col gap-2">
                          {client.email !== '\u2014' && (<div className="group/email flex items-center gap-2 min-w-0"><Mail className="w-4 h-4 text-gray-400 group-hover/email:text-emerald-900 flex-shrink-0 transition-colors" /><span className="text-sm text-gray-600 group-hover/email:text-emerald-950 truncate transition-colors">{client.email}</span></div>)}
                          {client.phone !== '\u2014' && (<div className="group/phone flex items-center gap-2 min-w-0"><Phone className="w-4 h-4 text-gray-400 group-hover/phone:text-emerald-900 flex-shrink-0 transition-colors" /><span className="text-sm text-gray-600 group-hover/phone:text-emerald-950 truncate transition-colors">{client.phone}</span></div>)}
                        </div>
                      </td>)}
                      <td className="px-4 py-3 text-right" style={{ width: '60px', minWidth: '60px' }}>
                        <ChevronRight className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-200 overflow-y-auto flex-1">
            {filteredClients.map((client) => (
              <div key={client.id} onClick={() => onClientClick(client.id)} className="p-4 hover:bg-gray-50 cursor-pointer active:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between gap-5 mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/10 flex items-center justify-center flex-shrink-0">
                      {client.type === 'person' ? <Users className="w-4 h-4 text-emerald-900" /> : <Building className="w-4 h-4 text-emerald-900" />}
                    </div>
                    <span className="font-medium text-base flex-1 min-w-[100px] truncate">{client.name}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">{renderAdviceCells(client, true)}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase flex-shrink-0 ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{client.status}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {client.managers.length > 0 && (<div className="flex items-start gap-2"><UserCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /><div className="text-gray-600 text-sm">{client.managers.map((m) => m.name).join(', ')}</div></div>)}
                  {client.email !== '\u2014' && (<div className="flex items-start gap-2"><Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /><div className="text-gray-900 break-all flex-1 min-w-0">{client.email}</div></div>)}
                  {client.phone !== '\u2014' && (<div className="flex items-start gap-2"><Smartphone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /><div className="text-gray-900 break-words flex-1">{client.phone}</div></div>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {showFilterModal && (
          <ClientFilterModal activeFilter={activeFilter} setActiveFilter={setActiveFilter} selectedStatuses={selectedStatuses} setSelectedStatuses={setSelectedStatuses}
            selectedManager={selectedManager} setSelectedManager={setSelectedManager} managers={managers} statuses={statuses} onClose={() => setShowFilterModal(false)} />
        )}

        {/* Search Modal - Mobile Only */}
        {showSearchModal && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className={`absolute inset-0 z-10 transition-opacity duration-700 ${searchModalAnimating ? 'opacity-0' : 'opacity-100'}`} onClick={handleCloseSearchModal} />
            <div className={`absolute inset-0 bg-white/5 backdrop-blur-xl shadow-lg flex flex-col justify-center transition-all duration-700 ease-in-out z-20 ${searchModalAnimating ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
              <button onClick={handleCloseSearchModal} className="absolute top-4 right-4 p-2.5 bg-white hover:bg-gray-100 rounded-sm transition-colors shadow-lg z-10"><X className="w-7 h-7 text-gray-600" /></button>
              <div className="px-4 sm:px-8 md:px-12">
                <h2 className="text-center text-2xl font-semibold text-gray-900 mb-6">Search Clients</h2>
                <div className="relative flex flex-col gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-sm text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-transparent" autoFocus />
                    {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>)}
                  </div>
                  <button onClick={handleCloseSearchModal} className="w-full px-4 py-2.5 bg-emerald-900 text-white rounded-sm hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm">Search</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Client Modal */}
        <AddClientModal isOpen={showAddClientModal} onClose={() => setShowAddClientModal(false)} newClientForm={newClientForm} setNewClientForm={setNewClientForm} onSubmit={handleAddClient} />
      </div>
    </TooltipProvider>
  );
}
