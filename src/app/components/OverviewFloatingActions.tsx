import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  LayoutGrid,
  ClipboardList,
  Target,
  TrendingUp,
  Clock,
  Zap,
  CalendarPlus,
  MailPlus,
  FilePlus,
  NotebookPen,
  ClipboardCheck,
  Mic,
  Sparkles,
  User,
} from 'lucide-react';
import { QuickActionsMenu } from './QuickActionsMenu';

interface OverviewFloatingActionsProps {
  visibleModules: { factFind: boolean; aiSummary: boolean; details: boolean; quickStats: boolean; opportunities: boolean; activities: boolean; quickActions: boolean };
  toggleModule: (key: string) => void;
  setShowAddEventModal: (show: boolean) => void;
  setShowSendEmailModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
  setShowAddNoteModal: (show: boolean) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowAddOpportunityModal: (show: boolean) => void;
  setShowAIAssistantModal: (show: boolean) => void;
}

export function OverviewFloatingActions({
  visibleModules,
  toggleModule,
  setShowAddEventModal,
  setShowSendEmailModal,
  setShowAddDocumentModal,
  setShowAddNoteModal,
  setShowAddTaskModal,
  setShowAddOpportunityModal,
  setShowAIAssistantModal,
}: OverviewFloatingActionsProps) {
  const [isViewsMenuOpen, setIsViewsMenuOpen] = useState(false);
  const [isQuickActionsMenuOpen, setIsQuickActionsMenuOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-0 right-0 lg:left-auto lg:right-3 lg:bottom-3 z-50 px-4 lg:px-0">
      <div className="flex items-center gap-3 justify-between lg:justify-end">
        {/* Views Menu Button */}
        <Popover.Root open={isViewsMenuOpen} onOpenChange={setIsViewsMenuOpen}>
          <Popover.Trigger asChild>
            <button
              className="bg-white rounded-full shadow-lg border border-gray-200 p-4 transition-transform active:scale-95 md:hover:bg-[#F2E9E4]"
              aria-label="Views Menu"
            >
              <LayoutGrid className="w-5 h-5 text-[#0B3D2E]" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              align="start"
              sideOffset={8}
              className="w-56 bg-white rounded-sm shadow-md border border-gray-200 py-2 z-[60] animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
            >
              <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">Views</span>
              </div>

              <div className="py-2 max-h-96 overflow-y-auto">
                {[
                  { key: 'details', label: 'Client Details', icon: User, iconColor: 'text-[#4F46E5]' },
                  { key: 'aiSummary', label: 'AI Summary', icon: Sparkles, iconColor: 'text-[#9333EA]' },
                  { key: 'factFind', label: 'Fact-Find', icon: ClipboardList, iconColor: 'text-[#0891B2]' },
                  { key: 'opportunities', label: 'Opportunities', icon: Target, iconColor: 'text-[#EA580C]' },
                  { key: 'quickStats', label: 'Quick Stats', icon: TrendingUp, iconColor: 'text-[#2D6A4F]' },
                  { key: 'activities', label: 'Activities', icon: Clock, iconColor: 'text-[#0284C7]' },
                  { key: 'quickActions', label: 'Quick Actions', icon: Zap, iconColor: 'text-gray-500' },
                ].map((module, index, array) => {
                  const Icon = module.icon;
                  return (
                    <div key={module.key}>
                      <button
                        onClick={() => toggleModule(module.key)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${visibleModules[module.key as keyof typeof visibleModules]
                            ? 'bg-[#0B3D2E] border-[#0B3D2E]'
                            : 'border-gray-300 bg-white'
                          }`}>
                          {visibleModules[module.key as keyof typeof visibleModules] && (
                            <span className="text-white text-xs leading-none">✓</span>
                          )}
                        </div>
                        <Icon className={`w-4 h-4 ${module.iconColor} flex-shrink-0`} />
                        <span className="text-sm text-gray-700">{module.label}</span>
                      </button>
                      {index < array.length - 1 && <div className="h-px bg-gray-100 mx-2" />}
                    </div>
                  );
                })}
              </div>

              <Popover.Arrow className="fill-white" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Quick Actions - Right Side */}
        {visibleModules.quickActions && (
          <>
            {/* Quick Actions Button - Shows on screens <= 445px */}
            <div className="max-[445px]:block hidden">
              <Popover.Root open={isQuickActionsMenuOpen} onOpenChange={setIsQuickActionsMenuOpen}>
                <Popover.Trigger asChild>
                  <button
                    className="bg-white rounded-full shadow-lg border border-gray-200 p-4 transition-transform active:scale-95"
                    aria-label="Quick Actions Menu"
                  >
                    <Zap className="w-5 h-5 text-orange-600" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="top"
                    align="end"
                    sideOffset={8}
                    className="w-56 bg-white rounded-sm shadow-md border border-gray-200 py-2 z-[60] animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
                  >
                    <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">Quick Actions</span>
                    </div>

                    <div className="py-2">
                      <button onClick={() => { setShowAddEventModal(true); setIsQuickActionsMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <CalendarPlus className="w-4 h-4 text-[#2D6A4F]" />
                        <span className="text-sm text-gray-700">Schedule Meeting</span>
                      </button>
                      <div className="h-px bg-gray-100 mx-2" />
                      <button onClick={() => { setShowSendEmailModal(true); setIsQuickActionsMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <MailPlus className="w-4 h-4 text-[#2563EB]" />
                        <span className="text-sm text-gray-700">Send Email</span>
                      </button>
                      <div className="h-px bg-gray-100 mx-2" />
                      <button onClick={() => { setShowAddDocumentModal(true); setIsQuickActionsMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <FilePlus className="w-4 h-4 text-[#4F46E5]" />
                        <span className="text-sm text-gray-700">Add Document</span>
                      </button>
                      <div className="h-px bg-gray-100 mx-2" />
                      <button onClick={() => { setShowAddNoteModal(true); setIsQuickActionsMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <NotebookPen className="w-4 h-4 text-[#D97706]" />
                        <span className="text-sm text-gray-700">Create Note</span>
                      </button>
                      <div className="h-px bg-gray-100 mx-2" />
                      <button onClick={() => { setShowAddTaskModal(true); setIsQuickActionsMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <ClipboardCheck className="w-4 h-4 text-[#0891B2]" />
                        <span className="text-sm text-gray-700">Create Task</span>
                      </button>
                      <div className="h-px bg-gray-100 mx-2" />
                      <button onClick={() => { setIsQuickActionsMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <Target className="w-4 h-4 text-[#EA580C]" />
                        <span className="text-sm text-gray-700">Add Opportunity</span>
                      </button>
                      <div className="h-px bg-gray-100 mx-2" />
                      <button onClick={() => { setIsQuickActionsMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <Mic className="w-4 h-4 text-[#DC2626]" />
                        <span className="text-sm text-gray-700">Voice Recording</span>
                      </button>
                      <div className="h-px bg-gray-100 mx-2" />
                      <button onClick={() => { setShowAIAssistantModal(true); setIsQuickActionsMenuOpen(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                        <Sparkles className="w-4 h-4 text-[#9333EA]" />
                        <span className="text-sm text-gray-700">AI Assistant</span>
                      </button>
                    </div>

                    <Popover.Arrow className="fill-white" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>

            {/* Quick Actions Bar - Shows on screens > 445px */}
            <QuickActionsMenu
              setShowAddEventModal={setShowAddEventModal}
              setShowSendEmailModal={setShowSendEmailModal}
              setShowAddDocumentModal={setShowAddDocumentModal}
              setShowAddNoteModal={setShowAddNoteModal}
              setShowAddTaskModal={setShowAddTaskModal}
              setShowAddOpportunityModal={setShowAddOpportunityModal}
              setShowAIAssistantModal={setShowAIAssistantModal}
            />
          </>
        )}
      </div>
    </div>
  );
}
