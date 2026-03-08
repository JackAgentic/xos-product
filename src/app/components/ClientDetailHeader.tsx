import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clientMenuItems, adviceMenuItems } from '../data/menuData';
import {
  ChevronDown,
  MoreVertical,
  Menu,
  Building,
  Users,
  CalendarPlus,
  MailPlus,
  FilePlus,
  NotebookPen,
  ClipboardCheck,
  Target,
  Mic,
  LayoutGrid,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface ClientDetailHeaderProps {
  selectedClient: any;
  activeClientMenu: string;
  changeTab: (tab: string) => void;
  onBackToList: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  visibleModules: { quickActions: boolean;[key: string]: boolean };
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
}

export function ClientDetailHeader({
  selectedClient,
  activeClientMenu,
  changeTab,
  onBackToList,
  setMobileDrawerOpen,
  visibleModules,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal,
}: ClientDetailHeaderProps) {
  const [mobileIconMenuOpen, setMobileIconMenuOpen] = useState(false);
  const [openAdviceDropdown, setOpenAdviceDropdown] = useState<string | null>(null);
  const mobileIconMenuRef = useRef<HTMLDivElement>(null);
  const adviceDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileIconMenuRef.current && !mobileIconMenuRef.current.contains(event.target as Node)) {
        setMobileIconMenuOpen(false);
      }

      if (openAdviceDropdown) {
        const dropdownRef = adviceDropdownRefs.current[openAdviceDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setOpenAdviceDropdown(null);
        }
      }
    };

    if (mobileIconMenuOpen || openAdviceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileIconMenuOpen, openAdviceDropdown]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 lg:gap-4 px-4">
          {/* Left: Mobile Menu + Back Button + Client Name + Divider + Icon Menu */}
          <div className="flex items-center gap-2 min-w-0 flex-1 py-2">
            {/* Mobile Burger Menu */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 hover:bg-gray-100 rounded lg:hidden flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Logo - visible on mobile */}
            <button
              onClick={onBackToList}
              className="flex-shrink-0 lg:hidden p-2 -ml-2 hover:opacity-70 transition-opacity"
            >
              <svg width="25" height="9" viewBox="0 0 25 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto">
                <path d="M23.9311 8.65188C23.6031 8.65188 23.3591 8.57188 23.1991 8.41188C23.0471 8.24388 22.9711 8.03188 22.9711 7.77588V7.55988C22.9711 7.30388 23.0471 7.09188 23.1991 6.92388C23.3591 6.75588 23.6031 6.67188 23.9311 6.67188C24.2671 6.67188 24.5111 6.75588 24.6631 6.92388C24.8151 7.09188 24.8911 7.30388 24.8911 7.55988V7.77588C24.8911 8.03188 24.8151 8.24388 24.6631 8.41188C24.5111 8.57188 24.2671 8.65188 23.9311 8.65188Z" fill="#0B3D2E" />
                <path d="M18.3951 8.664C17.6751 8.664 17.0631 8.536 16.5591 8.28C16.0631 8.024 15.6351 7.688 15.2751 7.272L16.3431 6.24C16.6311 6.576 16.9511 6.832 17.3031 7.008C17.6631 7.184 18.0591 7.272 18.4911 7.272C18.9791 7.272 19.3471 7.168 19.5951 6.96C19.8431 6.744 19.9671 6.456 19.9671 6.096C19.9671 5.816 19.8871 5.588 19.7271 5.412C19.5671 5.236 19.2671 5.108 18.8271 5.028L18.0351 4.908C16.3631 4.644 15.5271 3.832 15.5271 2.472C15.5271 2.096 15.5951 1.756 15.7311 1.452C15.8751 1.148 16.0791 0.888 16.3431 0.672C16.6071 0.456 16.9231 0.292 17.2911 0.18C17.6671 0.0599999 18.0911 0 18.5631 0C19.1951 0 19.7471 0.104 20.2191 0.312C20.6911 0.52 21.0951 0.828 21.4311 1.236L20.3511 2.256C20.1431 2 19.8911 1.792 19.5951 1.632C19.2991 1.472 18.9271 1.392 18.4791 1.392C18.0231 1.392 17.6791 1.48 17.4471 1.656C17.2231 1.824 17.1111 2.064 17.1111 2.376C17.1111 2.696 17.2031 2.932 17.3871 3.084C17.5711 3.236 17.8671 3.348 18.2751 3.42L19.0551 3.564C19.9031 3.716 20.5271 3.988 20.9271 4.38C21.3351 4.764 21.5391 5.304 21.5391 6C21.5391 6.4 21.4671 6.764 21.3231 7.092C21.1871 7.412 20.9831 7.692 20.7111 7.932C20.4471 8.164 20.1191 8.344 19.7271 8.472C19.3431 8.6 18.8991 8.664 18.3951 8.664Z" fill="#081C15" />
                <path d="M10.5713 8.664C10.0193 8.664 9.51934 8.572 9.07134 8.388C8.62334 8.204 8.23934 7.928 7.91934 7.56C7.60734 7.192 7.36334 6.74 7.18734 6.204C7.01134 5.668 6.92334 5.044 6.92334 4.332C6.92334 3.628 7.01134 3.008 7.18734 2.472C7.36334 1.928 7.60734 1.472 7.91934 1.104C8.23934 0.736 8.62334 0.46 9.07134 0.276C9.51934 0.092 10.0193 0 10.5713 0C11.1233 0 11.6233 0.092 12.0713 0.276C12.5193 0.46 12.9033 0.736 13.2233 1.104C13.5433 1.472 13.7873 1.928 13.9553 2.472C14.1313 3.008 14.2193 3.628 14.2193 4.332C14.2193 5.044 14.1313 5.668 13.9553 6.204C13.7873 6.74 13.5433 7.192 13.2233 7.56C12.9033 7.928 12.5193 8.204 12.0713 8.388C11.6233 8.572 11.1233 8.664 10.5713 8.664ZM10.5713 7.26C11.1713 7.26 11.6473 7.06 11.9993 6.66C12.3593 6.26 12.5393 5.7 12.5393 4.98V3.684C12.5393 2.964 12.3593 2.404 11.9993 2.004C11.6473 1.604 11.1713 1.404 10.5713 1.404C9.97134 1.404 9.49134 1.604 9.13134 2.004C8.77934 2.404 8.60334 2.964 8.60334 3.684V4.98C8.60334 5.7 8.77934 6.26 9.13134 6.66C9.49134 7.06 9.97134 7.26 10.5713 7.26Z" fill="#081C15" />
                <path d="M0 8.51986L2.136 5.33986L0.048 2.25586H1.8L3.096 4.33186H3.144L4.428 2.25586H6.06L3.936 5.36386L6.072 8.51986H4.32L3 6.35986H2.952L1.632 8.51986H0Z" fill="#081C15" />
              </svg>
            </button>

            <button
              onClick={onBackToList}
              className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
            </button>
            <div className="flex items-center justify-center hidden sm:flex flex-shrink-0">
              {selectedClient.type === 'person' ? (
                <Users className="w-5 h-5 text-gray-600" />
              ) : (
                <Building className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1 lg:flex-initial lg:max-w-[250px]">
              <h1 className="text-sm font-semibold truncate">{selectedClient.name}</h1>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0 hidden [@media(min-width:1200px)]:block" />

            {/* Desktop: Horizontal Icon Menu */}
            <div className="hidden [@media(min-width:1200px)]:flex items-center gap-0 overflow-x-auto scrollbar-hide">
              {clientMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => changeTab(item.id)}
                        className={`relative p-2 rounded transition-colors flex-shrink-0 ${activeClientMenu === item.id
                          ? 'bg-emerald-900/5 text-emerald-900'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.badge && (
                          <span className="absolute top-0 right-0 bg-emerald-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0" />

              {/* Advice Items */}
              {adviceMenuItems.map((item) => {
                const Icon = item.icon;

                if (item.hasDropdown) {
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      ref={(el) => { if (el) adviceDropdownRefs.current[item.id] = el; }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setOpenAdviceDropdown(openAdviceDropdown === item.id ? null : item.id)}
                            className={`p-2 rounded transition-colors flex-shrink-0 flex items-center gap-1 ${openAdviceDropdown === item.id
                              ? 'bg-emerald-900/5 text-emerald-900'
                              : 'text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                            <ChevronDown className={`w-3 h-3 transition-transform ${openAdviceDropdown === item.id ? 'rotate-180' : ''}`} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={10}>
                          {item.label}
                        </TooltipContent>
                      </Tooltip>

                      <AnimatePresence>
                        {openAdviceDropdown === item.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full mt-2 left-0 w-48 bg-white rounded shadow-lg border border-gray-200 py-2 z-50"
                          >
                            {item.dropdownItems?.map((dropdownItem) => (
                              <button
                                key={dropdownItem.id}
                                onClick={() => {
                                  setOpenAdviceDropdown(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                {dropdownItem.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => changeTab(item.id)}
                        className={`p-2 rounded transition-colors flex-shrink-0 ${activeClientMenu === item.id
                          ? 'bg-emerald-900/5 text-emerald-900'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Mobile: Icon Menu Dropdown */}
            <div className="relative [@media(min-width:1200px)]:hidden flex-shrink-0 ml-2" ref={mobileIconMenuRef}>
              <button
                onClick={() => setMobileIconMenuOpen(!mobileIconMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-1 border border-gray-200"
              >
                {(() => {
                  const activeItem = [...clientMenuItems, ...adviceMenuItems].find(item => item.id === activeClientMenu);
                  const ActiveIcon = activeItem?.icon || LayoutGrid;
                  return <ActiveIcon className="w-5 h-5 text-gray-600" />;
                })()}
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${mobileIconMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {mobileIconMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg border border-gray-200 py-2 z-50 max-h-[400px] overflow-y-auto"
                  >
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Main</div>
                    {clientMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            changeTab(item.id);
                            setMobileIconMenuOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${activeClientMenu === item.id ? 'bg-emerald-900/5 text-emerald-900' : 'text-gray-700'
                            }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="bg-emerald-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    <div className="border-t border-gray-200 my-2" />
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Advice</div>

                    {adviceMenuItems.map((item) => {
                      const Icon = item.icon;

                      if (item.hasDropdown) {
                        return (
                          <div key={item.id}>
                            <button
                              onClick={() => setOpenAdviceDropdown(openAdviceDropdown === item.id ? null : item.id)}
                              className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${openAdviceDropdown === item.id ? 'bg-gray-50 text-emerald-900' : 'text-gray-700'
                                }`}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <span className="text-sm flex-1">{item.label}</span>
                              <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${openAdviceDropdown === item.id ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {openAdviceDropdown === item.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden bg-gray-50"
                                >
                                  {item.dropdownItems?.map((dropdownItem) => (
                                    <button
                                      key={dropdownItem.id}
                                      onClick={() => {
                                        setMobileIconMenuOpen(false);
                                        setOpenAdviceDropdown(null);
                                      }}
                                      className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                      {dropdownItem.label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            changeTab(item.id);
                            setMobileIconMenuOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${activeClientMenu === item.id ? 'bg-emerald-900/5 text-emerald-900' : 'text-gray-700'
                            }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Quick Actions - Only visible on 2xl+ screens */}
          {visibleModules.quickActions && (
            <div className="hidden 2xl:flex items-center gap-0 py-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setShowAddEventModal(true)} className="p-2 rounded transition-colors flex-shrink-0 text-emerald-700 hover:bg-emerald-700/10">
                    <CalendarPlus className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10}>Schedule Meeting</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setShowSendEmailModal(true)} className="p-2 rounded transition-colors flex-shrink-0 text-blue-600 hover:bg-blue-600/10">
                    <MailPlus className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10}>Send Email</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setShowAddDocumentModal(true)} className="p-2 rounded transition-colors flex-shrink-0 text-indigo-600 hover:bg-indigo-600/10">
                    <FilePlus className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10}>Add Document</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setShowAddNoteModal(true)} className="p-2 rounded transition-colors flex-shrink-0 text-amber-600 hover:bg-amber-600/10">
                    <NotebookPen className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10}>Create Note</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setShowAddTaskModal(true)} className="p-2 rounded transition-colors flex-shrink-0 text-cyan-600 hover:bg-cyan-600/10">
                    <ClipboardCheck className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10}>Create Task</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setShowAddOpportunityModal(true)} className="p-2 rounded transition-colors flex-shrink-0 text-orange-600 hover:bg-orange-600/10">
                    <Target className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10}>Add Opportunity</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => { }} className="p-2 rounded transition-colors flex-shrink-0 text-red-600 hover:bg-red-600/10">
                    <Mic className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10}>Voice Recording</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
