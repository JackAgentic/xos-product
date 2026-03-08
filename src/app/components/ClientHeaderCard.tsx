import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Users, Building, Edit, ClipboardList, Sparkles, RefreshCw, Check, ChevronDown, PanelLeftClose } from 'lucide-react';

interface OnboardingItem {
  id: string;
  label: string;
  completed: boolean;
  completedDate: string | null;
}

interface ContactOnboardingData {
  contactId: number;
  contactName: string;
  contactType: string;
  items: OnboardingItem[];
}

interface ClientHeaderCardProps {
  selectedClient: any;
  allOnboardingCompleted: boolean;
  visibleModules: any;
  editingDetails: boolean;
  setEditingDetails: (value: boolean) => void;
  contactOnboarding: ContactOnboardingData[];
  toggleOnboardingItem: (contactId: number, itemId: string) => void;
}

export function ClientHeaderCard({
  selectedClient,
  allOnboardingCompleted,
  visibleModules,
  editingDetails,
  setEditingDetails,
  contactOnboarding,
  toggleOnboardingItem,
}: ClientHeaderCardProps) {
  const [selectedContactId, setSelectedContactId] = useState<number>(contactOnboarding[0]?.contactId ?? 0);
  const [onboardingCollapsed, setOnboardingCollapsed] = useState(false);

  const selectedContact = contactOnboarding.find(c => c.contactId === selectedContactId) ?? contactOnboarding[0];

  const totalCompleted = contactOnboarding.reduce((sum, c) => sum + c.items.filter(i => i.completed).length, 0);
  const totalItems = contactOnboarding.reduce((sum, c) => sum + c.items.length, 0);
  const overallPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <div className="lg:order-1 lg:flex-[2]">
      <div className="bg-white rounded-sm border border-gray-200 h-full flex flex-col md:flex-row overflow-hidden" data-ai-section="Client Header">
        {/* LEFT: Client Info */}
        <div className="flex-1 p-4 flex flex-col min-w-0">
          <div className="flex items-start justify-between mb-4 sm:mb-6 flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-900 rounded flex items-center justify-center">
                {selectedClient.type === 'person' ? (
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                ) : (
                  <Building className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-semibold" data-ai-field="clientName" data-ai-label="Client Name" data-ai-editable="true">{selectedClient.name}</h1>
                  <AnimatePresence>
                    {visibleModules.onboarding && (allOnboardingCompleted || onboardingCollapsed) && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 20 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                        onClick={() => setOnboardingCollapsed(false)}
                        className="w-7 h-7 bg-cyan-50 rounded flex items-center justify-center hover:bg-cyan-100 transition-colors"
                        title={allOnboardingCompleted ? 'Onboarding complete — click to view' : 'Expand onboarding'}
                      >
                        <ClipboardList className="w-4 h-4 text-cyan-600" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    selectedClient.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-yellow-50 text-yellow-800'
                  }`} data-ai-field="clientStatus" data-ai-label="Client Status">
                    {selectedClient.status === 'ACTIVE' ? 'Active' : 'Prospect'}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500" data-ai-field="clientId" data-ai-label="Client ID">Client ID: #HC{String(selectedClient.id).padStart(3, '0')}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setEditingDetails(!editingDetails)}
              className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
            >
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* AI Summary */}
            {visibleModules.aiSummary && (
            <div className="bg-gray-50 rounded-sm p-4 mb-6 border border-gray-200 flex flex-col" data-ai-section="AI Summary">
              <div className="flex items-start gap-3 flex-shrink-0 mb-2">
                <div className="w-8 h-8 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">AI SUMMARY</span>
                    <button className="p-0.5 hover:bg-white/50 rounded">
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-[8] flex-1" data-ai-field="aiSummaryText" data-ai-label="AI Summary Text">
                  The client profile centers around a household with the primary contact being "Another Client." Although specific details about the household members remain unspecified, the primary contact serves as an essential figure in any financial planning discussions. This individual's involvement suggests a collaborative approach to managing the household's financial affairs, potentially...
                </p>
                <button className="text-sm text-gray-600 hover:text-emerald-800 font-medium mt-2 flex-shrink-0">Read more</button>
              </div>
            </div>
            )}

            {/* Client Details Grid */}
            {visibleModules.details && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" data-ai-section="Client Details">
              <div className="sm:col-span-2 md:col-span-1" data-ai-field="email" data-ai-label="Email" data-ai-editable="true">
                <div className="text-xs font-medium text-gray-500 mb-1.5">EMAIL</div>
                <div className="text-sm text-gray-900 break-all">{selectedClient.email || '—'}</div>
              </div>
              <div data-ai-field="phone" data-ai-label="Phone" data-ai-editable="true">
                <div className="text-xs font-medium text-gray-500 mb-1.5">PHONE</div>
                <div className="text-sm text-gray-900">{selectedClient.phone || '—'}</div>
              </div>
              <div data-ai-field="dateOfBirth" data-ai-label="Date of Birth" data-ai-editable="true">
                <div className="text-xs font-medium text-gray-500 mb-1.5">DATE OF BIRTH</div>
                <div className="text-sm text-gray-600">Not set</div>
              </div>
              <div data-ai-field="nationality" data-ai-label="Nationality" data-ai-editable="true">
                <div className="text-xs font-medium text-gray-500 mb-1.5">NATIONALITY</div>
                <div className="text-sm text-gray-600">Not set</div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* RIGHT: Onboarding Panel — hidden when collapsed or all completed */}
        <AnimatePresence>
        {visibleModules.onboarding && !onboardingCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="md:w-[240px] lg:w-[280px] xl:w-[320px] border-t md:border-t-0 md:border-l border-gray-200 flex flex-col bg-gray-50/50 overflow-hidden"
            data-ai-section="Onboarding">
            {/* Header + overall progress — extra right padding at md to clear the floating Views button */}
            <div className="p-4 pb-3 md:pr-[72px] lg:pr-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-y-1">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Onboarding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">
                    {totalCompleted}/{totalItems}
                  </span>
                  <button
                    onClick={() => setOnboardingCollapsed(true)}
                    className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                    title="Collapse onboarding"
                  >
                    <PanelLeftClose className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-emerald-900 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-gray-500">{overallPercent}%</span>
              </div>
            </div>

            {/* Contact selector dropdown */}
            <div className="px-4 pb-3 flex-shrink-0">
              <div className="relative">
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(Number(e.target.value))}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-sm pl-3 pr-8 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900/30 cursor-pointer"
                >
                  {contactOnboarding.map(contact => {
                    const allDone = contact.items.every(i => i.completed);
                    const contactCompleted = contact.items.filter(i => i.completed).length;
                    return (
                      <option key={contact.contactId} value={contact.contactId}>
                        {contact.contactName} — {allDone ? '✓ Done' : `${contactCompleted}/${contact.items.length}`}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Selected contact's checklist */}
            {selectedContact && (
              <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedContact.contactId}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Checklist items */}
                    <div className="space-y-1">
                      {selectedContact.items.map(item => (
                        <div
                          key={item.id}
                          onClick={() => toggleOnboardingItem(selectedContact.contactId, item.id)}
                          className="flex items-center justify-between py-2 px-2.5 rounded-sm hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              item.completed ? 'bg-emerald-900 border-emerald-900' : 'border-gray-300 bg-white'
                            }`}>
                              {item.completed && <span className="text-white text-[10px]">✓</span>}
                            </div>
                            <span className={`text-sm transition-colors ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                              {item.label}
                            </span>
                          </div>
                          {item.completed && item.completedDate && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{item.completedDate}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
