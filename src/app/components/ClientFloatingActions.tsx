import { useState, useEffect, useRef } from 'react';
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
    User,
    Sparkles,
    PanelRightClose,
    PanelRightOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuickActionsMenu } from './QuickActionsMenu';
import { useAIDrag } from './AIDragToInspect';

interface ClientFloatingActionsProps {
    activeTab: string;
    visibleModules: { onboarding: boolean; aiSummary: boolean; details: boolean; quickStats: boolean; opportunities: boolean; activities: boolean; quickActions: boolean };
    toggleModule: (key: string) => void;
    setShowAddEventModal: (show: boolean) => void;
    setShowSendEmailModal: (show: boolean) => void;
    setShowAddDocumentModal: (show: boolean) => void;
    setShowAddNoteModal: (show: boolean) => void;
    setShowAddTaskModal: (show: boolean) => void;
    setShowAddOpportunityModal: (show: boolean) => void;
}

export function ClientFloatingActions({
    activeTab,
    visibleModules,
    toggleModule,
    setShowAddEventModal,
    setShowSendEmailModal,
    setShowAddDocumentModal,
    setShowAddNoteModal,
    setShowAddTaskModal,
    setShowAddOpportunityModal,
}: ClientFloatingActionsProps) {
    const [isViewsMenuOpen, setIsViewsMenuOpen] = useState(false);
    const { isDrawerOpen, setActions, registerPlaceholder } = useAIDrag();
    const [isActionsCollapsed, setIsActionsCollapsed] = useState(false);
    const [isOverCard, setIsOverCard] = useState(true);
    const viewsBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        let ticking = false;

        const checkOverlap = () => {
            if (!viewsBtnRef.current) return;
            const rect = viewsBtnRef.current.getBoundingClientRect();
            // Check pixel slightly to the left of the button
            const elements = document.elementsFromPoint(rect.left - 2, rect.top + rect.height / 2);

            if (elements) {
                // Check if any element behind it is a card (usually bg-white)
                const overCard = elements.some(el => el.classList.contains('bg-white'));
                setIsOverCard(overCard);
            }
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(checkOverlap);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onScroll, true);

        // Initial check
        const timeout = setTimeout(checkOverlap, 100);

        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onScroll, true);
            clearTimeout(timeout);
        };
    }, [activeTab]);

    useEffect(() => {
        // When collapsed, clear the actions slot so the AI orb returns to center
        if (isActionsCollapsed) {
            setActions(null);
            return;
        }

        setActions(
            <AnimatePresence mode="wait">
                <div className="flex items-center justify-center gap-1 h-14">
                    {/* Placeholder for the AI Orb to track resting position */}
                    {!isDrawerOpen && <div ref={registerPlaceholder} className="w-14 h-14 flex-shrink-0" />}

                    <motion.div
                        key="actions-bar"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="flex items-center h-14"
                    >
                        {/* Mobile View (Floating Button) */}
                        <div className="md:hidden">
                            <Popover.Root>
                                <Popover.Trigger asChild>
                                    <button className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 transition-transform active:scale-95">
                                        <Zap className="w-5 h-5 fill-gray-600" />
                                    </button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content
                                        side="top"
                                        align="end"
                                        sideOffset={12}
                                        className="bg-white rounded-sm shadow-md border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95"
                                    >
                                        <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Quick Actions</span>
                                        </div>
                                        <div className="py-1">
                                            <button onClick={() => { setShowAddEventModal(true); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                                                <CalendarPlus className="w-4 h-4 text-emerald-700" /> Schedule Meeting
                                            </button>
                                            <button onClick={() => { setShowSendEmailModal(true); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                                                <MailPlus className="w-4 h-4 text-blue-600" /> Send Email
                                            </button>
                                            <button onClick={() => { setShowAddDocumentModal(true); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                                                <FilePlus className="w-4 h-4 text-indigo-600" /> Add Document
                                            </button>
                                            <button onClick={() => { setShowAddNoteModal(true); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                                                <NotebookPen className="w-4 h-4 text-amber-600" /> Create Note
                                            </button>
                                            <button onClick={() => { setShowAddTaskModal(true); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                                                <ClipboardCheck className="w-4 h-4 text-cyan-600" /> Create Task
                                            </button>
                                            <button onClick={() => { setShowAddOpportunityModal(true); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                                                <Target className="w-4 h-4 text-orange-600" /> Add Opportunity
                                            </button>
                                            <button onClick={() => { /* Voice recording logic */ }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                                                <Mic className="w-4 h-4 text-red-600" /> Voice Recording
                                            </button>
                                        </div>
                                        <Popover.Arrow className="fill-white" />
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        </div>

                        {/* Desktop View (Horizontal Bar) */}
                        <div className="hidden md:flex items-center gap-2">
                            <QuickActionsMenu
                                setShowAddEventModal={setShowAddEventModal}
                                setShowSendEmailModal={setShowSendEmailModal}
                                setShowAddDocumentModal={setShowAddDocumentModal}
                                setShowAddNoteModal={setShowAddNoteModal}
                                setShowAddTaskModal={setShowAddTaskModal}
                                setShowAddOpportunityModal={setShowAddOpportunityModal}
                                onCollapse={() => setIsActionsCollapsed(true)}
                            />
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        );

        // Cleanup: clear actions when this component unmounts (navigating away from client page)
        return () => {
            setActions(null);
        };
    }, [
        activeTab,
        isViewsMenuOpen,
        isDrawerOpen,
        visibleModules,
        isActionsCollapsed,
        setShowAddEventModal,
        setShowSendEmailModal,
        setShowAddDocumentModal,
        setShowAddNoteModal,
        setShowAddTaskModal,
        setShowAddOpportunityModal,
        toggleModule,
        setActions
    ]);

    return (
        <>
            <AnimatePresence>
                {/* Expand Actions Button (shows when actions bar is collapsed) */}
                {isActionsCollapsed && (
                    <motion.button
                        key="expand-actions"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        onClick={() => setIsActionsCollapsed(false)}
                        className="fixed right-4 lg:right-6 bottom-4 lg:bottom-3 w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 text-gray-500 hover:text-gray-700 transition-transform active:scale-95 hover:bg-stone-50 z-[100]"
                        title="Expand Actions"
                    >
                        <PanelRightOpen className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
}
