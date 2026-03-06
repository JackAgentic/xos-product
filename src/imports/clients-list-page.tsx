import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { ClientsKanbanBoard } from './clients/ClientsKanbanBoard';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Plus, Search, Phone, ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight, Home, Building2, Shield, AlertCircle, Send, User, Coins, TrendingUp, ClipboardCheck, SlidersHorizontal, ListFilter } from 'lucide-react';
import { useClientList, SortField } from '@/hooks/useClientList';
import { ServiceStageIndicators } from './ServiceStageIndicators';
import { AddOpportunityModal } from './AddOpportunityModal';

interface ClientsListPageProps {
  activeSubSection: string;
  availableUsers: Array<{ id: string; name: string; email: string; userType: string }>;
  onAddClientClick: () => void;
}

type ColumnKey = 'status' | 'advice' | 'manager' | 'contact';

const COLUMN_LABELS: Record<ColumnKey, string> = {
  status: 'Status',
  advice: 'Advice',
  manager: 'Client Manager',
  contact: 'Contact Details',
};

const ALL_COLUMNS: ColumnKey[] = ['status', 'advice', 'manager', 'contact'];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'lead', label: 'Lead' },
  { value: 'archived', label: 'Archived' },
];

const ADVICE_TYPES = [
  { key: 'mortgage', icon: Home, label: 'Mortgage' },
  { key: 'kiwisaver', icon: Coins, label: 'KiwiSaver' },
  { key: 'insurance', icon: Shield, label: 'Insurance' },
  { key: 'investment', icon: TrendingUp, label: 'Investment' },
  { key: 'review', icon: ClipboardCheck, label: 'Review' },
];

const getClientTypeIcon = (type: string) => {
  const t = type.toLowerCase();
  const cls = "w-4 h-4 md:w-5 md:h-5 text-brand-primary";
  if (t === 'household') return <Home className={cls} />;
  if (t === 'company' || t === 'business') return <Building2 className={cls} />;
  if (t === 'trust') return <Shield className={cls} />;
  return <User className={cls} />;
};

const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'prospect': return 'bg-yellow-100 text-yellow-800';
    case 'inactive': return 'bg-gray-100 text-gray-600';
    case 'lead': return 'bg-blue-100 text-blue-700';
    case 'archived': return 'bg-red-100 text-red-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export function ClientsListPage({
  activeSubSection,
  availableUsers,
  onAddClientClick
}: ClientsListPageProps) {
  const navigate = useNavigate();

  const {
    filteredClients,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    managerFilter,
    setManagerFilter,
    sortField,
    sortDirection,
    handleSort,
    statusCounts,
    adviceTypeFilter,
    setAdviceTypeFilter,
    refreshClients
  } = useClientList(activeSubSection);

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([...ALL_COLUMNS]);
  const [opportunityModalOpen, setOpportunityModalOpen] = useState(false);
  const [opportunityClientId, setOpportunityClientId] = useState(0);
  const [opportunityClientName, setOpportunityClientName] = useState('');
  const [opportunityClientType, setOpportunityClientType] = useState('');
  const [opportunityServiceType, setOpportunityServiceType] = useState('');

  // Reset viewMode to table when leaving prospect filter
  useEffect(() => {
    if (statusFilter.length !== 1 || statusFilter[0] !== 'prospect') setViewMode('table');
  }, [statusFilter]);

  const isColumnVisible = (col: ColumnKey) => visibleColumns.includes(col);

  const toggleColumn = (col: ColumnKey) => {
    setVisibleColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleServiceClick = (clientId: string, clientName: string, clientType: string, serviceKey: string, service: { active: boolean; opportunityId?: number | null }) => {
    const numericId = parseInt(clientId.replace('client-', ''));
    if (service.active && service.opportunityId) {
      navigate(`/clients/client/${numericId}/opportunities/${service.opportunityId}`);
    } else {
      setOpportunityClientId(numericId);
      setOpportunityClientName(clientName);
      setOpportunityClientType(clientType);
      setOpportunityServiceType(serviceKey);
      setOpportunityModalOpen(true);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const onClientSelect = (clientId: string) => {
    navigate(`/clients/client/${clientId}`);
  };

  // Calculate dynamic column widths based on visible columns
  const getColWidths = () => {
    // Client column (always visible) + chevron column (always visible)
    // Distribute remaining space among visible optional columns
    const baseWidths: Record<ColumnKey, number> = {
      status: 10,
      advice: 16,
      manager: 20,
      contact: 23,
    };
    const clientBase = 25;
    const chevronBase = 6;
    const usedByOptional = visibleColumns.reduce((sum, col) => sum + baseWidths[col], 0);
    const remaining = 100 - clientBase - chevronBase - usedByOptional;
    // Distribute remaining evenly to client column
    const clientWidth = clientBase + remaining;
    return { clientWidth, baseWidths, chevronWidth: chevronBase };
  };

  const { clientWidth, baseWidths, chevronWidth } = getColWidths();

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 md:gap-6 mobile-clients-container px-3 md:px-6 pt-2 md:pt-4 h-full overflow-hidden min-w-0">
        {/* Page Heading */}
        <h1 className="font-bold text-gray-900 text-2xl md:text-[32px]">Clients</h1>

        {/* Filter Bar: Search + Kanban Toggle + Column Visibility + Add Client */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Inline Search */}
          <div className="relative w-[200px] min-w-[160px] max-w-[280px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full h-10 bg-white border-gray-200 text-[14px] placeholder:text-[14px] font-medium placeholder:font-medium rounded-lg"
            />
          </div>

          {/* Kanban Toggle (prospect only) */}
          {statusFilter.length === 1 && statusFilter[0] === 'prospect' && (
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}
              className={`h-10 px-4 text-[14px] font-medium transition-all flex items-center justify-center flex-shrink-0 rounded-lg ${viewMode === 'kanban'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Kanban
            </button>
          )}

          {/* Column Visibility Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="h-10 px-3 text-[14px] font-medium flex items-center gap-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                aria-label="Toggle columns"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden md:inline">Columns</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-1">Toggle columns</div>
              {ALL_COLUMNS.map(col => (
                <label
                  key={col}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-[14px]"
                >
                  <Checkbox
                    checked={isColumnVisible(col)}
                    onCheckedChange={() => toggleColumn(col)}
                  />
                  {COLUMN_LABELS[col]}
                </label>
              ))}
            </PopoverContent>
          </Popover>

          {/* Add Client Button */}
          <Button
            onClick={onAddClientClick}
            size="icon"
            className="ml-auto md:hidden size-11 shrink-0"
            aria-label="Add client"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Button
            onClick={onAddClientClick}
            className="hidden ml-auto md:flex"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Client
          </Button>
        </div>

        {/* Kanban Board (prospect + kanban viewMode) */}
        {statusFilter.length === 1 && statusFilter[0] === 'prospect' && viewMode === 'kanban' ? (
          <ClientsKanbanBoard clients={filteredClients} onClientSelect={onClientSelect} onStageChange={refreshClients} />
        ) : (
          <>
            {/* Desktop Client Table */}
            <Card className="hidden md:flex md:flex-col overflow-hidden rounded-lg flex-1 min-h-0 min-w-0">
              <CardContent className="p-0 [&:last-child]:pb-0 h-full overflow-y-auto">
                <Table containerClassName="overflow-visible" className="[&_th]:h-12 [&_th]:py-3 [&_td]:p-2 md:[&_td]:p-4 [&_td]:px-2 md:[&_td]:px-4 table-fixed w-full">
                  <colgroup>
                    <col style={{ width: `${clientWidth}%` }} />
                    {isColumnVisible('status') && <col style={{ width: `${baseWidths.status}%` }} />}
                    {isColumnVisible('advice') && <col style={{ width: `${baseWidths.advice}%` }} />}
                    {isColumnVisible('manager') && <col style={{ width: `${baseWidths.manager}%` }} />}
                    {isColumnVisible('contact') && <col style={{ width: `${baseWidths.contact}%` }} />}
                    <col style={{ width: `${chevronWidth}%` }} />
                  </colgroup>
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow>
                      <TableHead
                        className="cursor-pointer text-[14px] font-medium text-muted-foreground"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-2">
                          Client {getSortIcon('name')}
                        </div>
                      </TableHead>

                      {/* Status Header with Filter */}
                      {isColumnVisible('status') && (
                        <TableHead className="text-[14px] font-medium text-muted-foreground">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                                Status
                                <ListFilter className={`w-4 h-4 ${statusFilter.length > 0 ? 'text-brand-primary' : ''}`} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-64 p-2">
                              <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-1">
                                Filter by status
                              </div>
                              <button
                                onClick={() => setStatusFilter([])}
                                className={`w-full text-left px-2 py-2 rounded text-[14px] flex items-center justify-between ${statusFilter.length === 0
                                  ? 'bg-brand-primary/10 text-brand-primary font-medium'
                                  : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                              >
                                <span>All</span>
                                <span className="text-xs text-muted-foreground ml-4">
                                  {statusCounts.all > 99 ? '99+' : statusCounts.all}
                                </span>
                              </button>
                              {STATUS_OPTIONS.filter(s => s.value !== 'all').map(status => {
                                const isActive = statusFilter.includes(status.value);
                                return (
                                  <button
                                    key={status.value}
                                    onClick={() =>
                                      setStatusFilter(prev =>
                                        prev.includes(status.value)
                                          ? prev.filter(s => s !== status.value)
                                          : [...prev, status.value]
                                      )
                                    }
                                    className={`w-full text-left px-2 py-2 rounded text-[14px] flex items-center justify-between ${isActive
                                      ? 'bg-brand-primary/10 text-brand-primary font-medium'
                                      : 'hover:bg-gray-50 text-gray-700'
                                      }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Checkbox checked={isActive} />
                                      <span>{status.label}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground ml-4">
                                      {(statusCounts[status.value] ?? 0) > 99 ? '99+' : statusCounts[status.value] ?? 0}
                                    </span>
                                  </button>
                                );
                              })}
                            </PopoverContent>
                          </Popover>
                        </TableHead>
                      )}

                      {/* Advice Header with Filter */}
                      {isColumnVisible('advice') && (
                        <TableHead className="text-[14px] font-medium text-muted-foreground">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                                Advice
                                <ListFilter className={`w-4 h-4 ${adviceTypeFilter.length > 0 ? 'text-brand-primary' : ''}`} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-64 p-2">
                              <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-1">
                                Filter by advice type
                              </div>
                              <button
                                onClick={() => setAdviceTypeFilter([])}
                                className={`w-full text-left px-2 py-2 rounded text-[14px] ${adviceTypeFilter.length === 0
                                  ? 'bg-brand-primary/10 text-brand-primary font-medium'
                                  : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                              >
                                All
                              </button>
                              {ADVICE_TYPES.map(type => {
                                const isActive = adviceTypeFilter.includes(type.key);
                                const Icon = type.icon;
                                return (
                                  <button
                                    key={type.key}
                                    onClick={() =>
                                      setAdviceTypeFilter(prev =>
                                        prev.includes(type.key)
                                          ? prev.filter(t => t !== type.key)
                                          : [...prev, type.key]
                                      )
                                    }
                                    className={`w-full text-left px-2 py-2 rounded text-[14px] flex items-center gap-3 ${isActive
                                      ? 'bg-brand-primary/10 text-brand-primary font-medium'
                                      : 'hover:bg-gray-50 text-gray-700'
                                      }`}
                                  >
                                    <Checkbox checked={isActive} />
                                    <div className="flex items-center gap-2 truncate">
                                      <Icon className="w-4 h-4" />
                                      {type.label}
                                    </div>
                                  </button>
                                );
                              })}
                            </PopoverContent>
                          </Popover>
                        </TableHead>
                      )}

                      {/* Client Manager Header with Filter */}
                      {isColumnVisible('manager') && (
                        <TableHead className="text-[14px] font-medium text-muted-foreground whitespace-nowrap truncate">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                                Client Manager
                                <ListFilter className={`w-4 h-4 ${managerFilter.length > 0 ? 'text-brand-primary' : ''}`} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-72 p-2">
                              <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-1">
                                Filter by manager
                              </div>
                              <button
                                onClick={() => setManagerFilter([])}
                                className={`w-full text-left px-2 py-2 rounded text-[14px] ${managerFilter.length === 0
                                  ? 'bg-brand-primary/10 text-brand-primary font-medium'
                                  : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                              >
                                All Managers
                              </button>
                              {availableUsers.map(user => {
                                const isActive = managerFilter.includes(user.id);
                                return (
                                  <button
                                    key={user.id}
                                    onClick={() =>
                                      setManagerFilter(prev =>
                                        prev.includes(user.id)
                                          ? prev.filter(id => id !== user.id)
                                          : [...prev, user.id]
                                      )
                                    }
                                    className={`w-full text-left px-2 py-2 rounded text-[14px] flex items-center gap-3 ${isActive
                                      ? 'bg-brand-primary/10 text-brand-primary font-medium'
                                      : 'hover:bg-gray-50 text-gray-700'
                                      }`}
                                  >
                                    <Checkbox checked={isActive} />
                                    <span className="truncate">{user.name}</span>
                                  </button>
                                );
                              })}
                            </PopoverContent>
                          </Popover>
                        </TableHead>
                      )}

                      {isColumnVisible('contact') && (
                        <TableHead className="text-[14px] font-medium text-muted-foreground whitespace-nowrap">Contact Details</TableHead>
                      )}
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow
                        key={client.id}
                        className="group cursor-pointer hover:bg-gray-50"
                        onClick={() => onClientSelect(client.id.replace('client-', ''))}
                      >
                        {/* Client */}
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                                  {getClientTypeIcon(client.clientType)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">{client.clientType}</TooltipContent>
                            </Tooltip>
                            <div className="text-[14px] font-medium truncate">{client.name}</div>
                            {client.isVulnerableClient && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex-shrink-0"><AlertCircle className="w-4 h-4 text-orange-500" /></span>
                                </TooltipTrigger>
                                <TooltipContent>Vulnerable</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        {isColumnVisible('status') && (
                          <TableCell>
                            <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getStatusClasses(client.status)}`}>
                              {client.status.toUpperCase()}
                            </span>
                          </TableCell>
                        )}

                        {/* Services */}
                        {isColumnVisible('advice') && (
                          <TableCell>
                            <ServiceStageIndicators
                              services={client.services}
                              clientId={parseInt(client.id.replace('client-', ''))}
                              onServiceClick={(serviceKey, service) => {
                                handleServiceClick(client.id, client.name, client.clientType, serviceKey, service);
                              }}
                            />
                          </TableCell>
                        )}

                        {/* Client Manager */}
                        {isColumnVisible('manager') && (
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-0">
                              {client.accountManagers.length > 0 ? (
                                <>
                                  <Avatar className="w-8 h-8 shrink-0">
                                    <AvatarFallback className="bg-brand-primary text-white text-xs">
                                      {client.accountManagers[0].name ? client.accountManagers[0].name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-[14px] truncate">{client.accountManagers[0].name}</span>
                                </>
                              ) : (
                                <span className="text-[14px] text-gray-400">—</span>
                              )}
                            </div>
                          </TableCell>
                        )}

                        {/* Contact Details */}
                        {isColumnVisible('contact') && (
                          <TableCell>
                            {client.email || client.phone ? (
                              <div className="flex flex-col gap-1 text-[14px] min-w-0">
                                {client.email && (
                                  <a
                                    href={`/clients/client/${client.id.replace('client-', '')}/communication`}
                                    className="flex items-center gap-2 min-w-0 text-gray-500 hover:text-brand-primary transition-colors"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/clients/client/${client.id.replace('client-', '')}/communication`); }}
                                  >
                                    <Send className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{client.email}</span>
                                  </a>
                                )}
                                {client.phone && (
                                  <a
                                    href={`tel:${client.phone}`}
                                    className="flex items-center gap-2 min-w-0 text-gray-500 hover:text-brand-primary transition-colors"
                                    onClick={(e) => { e.stopPropagation(); }}
                                  >
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{client.phone}</span>
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-[14px] text-gray-400">—</span>
                            )}
                          </TableCell>
                        )}

                        {/* Chevron */}
                        <TableCell>
                          <div className="flex items-center justify-end pr-2">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Mobile Card List */}
            <div className="md:hidden flex-1 min-h-0 overflow-auto" role="list" aria-label="Clients">
              <div className="flex flex-col gap-3">
                {filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <p className="font-medium">No clients found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <Card
                      key={client.id}
                      role="listitem"
                      className="cursor-pointer active:bg-gray-50 transition-colors"
                      onClick={() => onClientSelect(client.id.replace('client-', ''))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            {getClientTypeIcon(client.clientType)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-medium truncate">{client.name}</span>
                              {client.isVulnerableClient && (
                                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                              )}
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium mt-1 ${getStatusClasses(client.status)}`}>
                              {client.status.toUpperCase()}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 mt-2 shrink-0" />
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <ServiceStageIndicators
                            services={client.services}
                            clientId={parseInt(client.id.replace('client-', ''))}
                            onServiceClick={(serviceKey, service) => {
                              handleServiceClick(client.id, client.name, client.clientType, serviceKey, service);
                            }}
                          />
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {client.accountManagers.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-brand-primary text-white text-[10px]">
                                  {client.accountManagers[0].name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[13px] text-gray-600 truncate">{client.accountManagers[0].name}</span>
                            </div>
                          ) : (
                            <span className="text-[13px] text-gray-400">No manager</span>
                          )}
                          <div className="flex items-center gap-4 text-[13px]">
                            {client.email && (
                              <button
                                className="flex items-center gap-1.5 min-w-0 min-h-[44px] text-gray-500 hover:text-brand-primary transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(`/clients/client/${client.id.replace('client-', '')}/communication`); }}
                              >
                                <Send className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </button>
                            )}
                            {client.phone && (
                              <button
                                className="flex items-center gap-1.5 shrink-0 min-h-[44px] text-gray-500 hover:text-brand-primary transition-colors"
                                onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${client.phone}`; }}
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{client.phone}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <AddOpportunityModal
        open={opportunityModalOpen}
        onOpenChange={setOpportunityModalOpen}
        clientId={opportunityClientId}
        clientName={opportunityClientName}
        clientType={opportunityClientType}
        serviceType={opportunityServiceType}
        onSuccess={() => refreshClients()}
      />
    </TooltipProvider>
  );
}
