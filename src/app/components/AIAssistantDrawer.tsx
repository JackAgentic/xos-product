import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIResponse, type Message, type AIAction, type NavLink } from '../utils/openai';
import { DEFAULT_DASHBOARD_CONFIG, DEFAULT_DASHBOARD_DATA, resolveChartData, type DashboardConfig, type DashboardData, type ChartWidgetConfig } from '../data/dashboardConfig';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  X,
  Send,
  Mic,
  AudioLines,
  ArrowUp,
  PenSquare,
  History,
  UserCircle,
  Crosshair,
  ChevronDown,
  BarChart2,
  PanelsTopLeft,
  Target,
  ClipboardList,
  DollarSign,
  Users,
  CalendarDays,
  FileText,
  MessageSquare,
  StickyNote,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAIDrag, type AIElementContext } from './AIDragToInspect';

const NAV_TAB_ICONS: Record<string, LucideIcon> = {
  overview: PanelsTopLeft,
  opportunities: Target,
  onboarding: ClipboardList,
  financials: DollarSign,
  contacts: Users,
  meetings: CalendarDays,
  documents: FileText,
  communication: MessageSquare,
  notes: StickyNote,
};
import { ChartWidget } from './ChartWidget';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  elementContext?: AIElementContext;
  dashboardConfig?: DashboardConfig;
  onDashboardConfigChange?: (config: DashboardConfig) => void;
  dashboardData?: DashboardData;
  onDashboardDataChange?: (data: DashboardData) => void;
  activeView?: string;
  clientName?: string;
  selectedClient?: any;
  allClients?: any[];
  allOpportunities?: any[];
  onNavigateTab?: (tabId: string) => void;
  onClientClick?: (clientId: number) => void;
  onAction?: (action: string) => void;
}

// Auto-link client names in AI response text with markdown links
function autoLinkClients(text: string, clients: any[]): string {
  if (!clients?.length) return text;
  // Sort by name length descending so longer names match first
  const sorted = [...clients].sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));
  let result = text;
  for (const client of sorted) {
    if (!client.name) continue;
    const escaped = client.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Only link if not already inside a markdown link
    const regex = new RegExp(`(?<!\\[)\\b(${escaped})\\b(?![^\\[]*\\])`, 'g');
    result = result.replace(regex, `[$1](#client:${client.id})`);
  }
  return result;
}

// Default series configs for inline charts
const INLINE_CHART_SERIES: Record<string, { dataKey: string; color: string; label: string; visible: boolean }[]> = {
  revenueData: [
    { dataKey: 'revenue', color: '#10b981', label: 'Revenue', visible: true },
    { dataKey: 'target', color: '#9ca3af', label: 'Target', visible: true },
  ],
  pipelineData: [
    { dataKey: 'amount', color: '#8b5cf6', label: 'Amount', visible: true },
  ],
  activityTrendData: [
    { dataKey: 'meetings', color: '#3b82f6', label: 'Meetings', visible: true },
    { dataKey: 'calls', color: '#f59e0b', label: 'Calls', visible: true },
    { dataKey: 'emails', color: '#10b981', label: 'Emails', visible: true },
  ],
};

const ACTION_LABELS: Record<string, { icon: string; label: string }> = {
  'add-event': { icon: 'CalendarDays', label: 'Schedule Meeting' },
  'send-email': { icon: 'MessageSquare', label: 'Send Email' },
  'add-document': { icon: 'FileText', label: 'Upload Document' },
  'add-note': { icon: 'StickyNote', label: 'Add Note' },
  'add-task': { icon: 'ClipboardList', label: 'Add Task' },
  'add-opportunity': { icon: 'Target', label: 'New Opportunity' },
};

const ACTION_ICONS: Record<string, LucideIcon> = {
  'add-event': CalendarDays,
  'send-email': MessageSquare,
  'add-document': FileText,
  'add-note': StickyNote,
  'add-task': ClipboardList,
  'add-opportunity': Target,
};

function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const result = JSON.parse(JSON.stringify(obj));
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

function applyAIActions(
  actions: AIAction[],
  config: DashboardConfig,
  data?: DashboardData,
): { config: DashboardConfig; data?: DashboardData } {
  let newConfig = { ...config, widgets: [...config.widgets] };
  let newData = data ? { ...data } : undefined;

  for (const action of actions) {
    switch (action.functionName) {
      case 'update_widget': {
        const { widgetId, changes } = action.args;
        newConfig.widgets = newConfig.widgets.map(w => {
          if (w.id !== widgetId) return w;
          if (changes.series && w.type === 'chart') {
            const existingSeries = (w as ChartWidgetConfig).series;
            const mergedSeries = changes.series.map((s: any, i: number) => ({
              ...(existingSeries[i] || { dataKey: s.dataKey, color: '#000', label: s.dataKey, visible: true }),
              ...s,
            }));
            return { ...w, ...changes, series: mergedSeries };
          }
          return { ...w, ...changes };
        });
        break;
      }
      case 'add_widget': {
        const maxOrder = Math.max(...newConfig.widgets.map(w => w.order), 0);
        const newWidget: ChartWidgetConfig = {
          id: `custom-${Date.now()}`,
          type: 'chart',
          chartType: action.args.chartType || 'bar',
          title: action.args.title || 'New Chart',
          subtitle: action.args.subtitle || '',
          visible: true,
          dataSource: action.args.dataSource || 'revenueData',
          series: (action.args.series || []).map((s: any) => ({ ...s, visible: true })),
          colors: {},
          colSpan: action.args.colSpan || 1,
          order: maxOrder + 1,
        };
        newConfig.widgets = [...newConfig.widgets, newWidget];
        break;
      }
      case 'remove_widget': {
        newConfig.widgets = newConfig.widgets.filter(w => w.id !== action.args.widgetId);
        break;
      }
      case 'reset_dashboard': {
        newConfig = { ...DEFAULT_DASHBOARD_CONFIG, widgets: [...DEFAULT_DASHBOARD_CONFIG.widgets] };
        break;
      }
      case 'update_data': {
        if (!newData) break;
        const { dataSource, index, field, value, kpiPath } = action.args;
        if (kpiPath && value !== undefined) {
          newData = { ...newData, kpis: setNestedValue(newData.kpis, kpiPath, value) };
        } else if (dataSource && index !== undefined && field && value !== undefined) {
          const arr = [...(newData as any)[dataSource]];
          arr[index] = { ...arr[index], [field]: value };
          newData = { ...newData, [dataSource]: arr };
        }
        break;
      }
      case 'reset_data': {
        newData = { ...DEFAULT_DASHBOARD_DATA };
        break;
      }
    }
  }

  return { config: newConfig, data: newData };
}

export function AIAssistantDrawer({ isOpen, onClose, elementContext, dashboardConfig, onDashboardConfigChange, dashboardData, onDashboardDataChange, activeView, clientName, selectedClient, allClients, allOpportunities, onNavigateTab, onClientClick, onAction }: AIAssistantDrawerProps) {
  const { isDragging } = useAIDrag();
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const [displayedChars, setDisplayedChars] = useState(0);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [showTranscriptionText, setShowTranscriptionText] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(30).fill(0));
  const [chartPreviewCollapsed, setChartPreviewCollapsed] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Resolve inspected chart widget (if user dragged onto a chart)
  const inspectedChart = useMemo(() => {
    if (!elementContext?.fieldName || !dashboardConfig) return null;
    const widget = dashboardConfig.widgets.find(
      w => w.id === elementContext.fieldName && w.type === 'chart'
    );
    return (widget as ChartWidgetConfig) ?? null;
  }, [elementContext?.fieldName, dashboardConfig]);

  const chartPreviewData = useMemo(() => {
    if (!inspectedChart || !dashboardData) return [];
    return resolveChartData(inspectedChart.dataSource, dashboardData, inspectedChart.dateRange);
  }, [inspectedChart, dashboardData]);

  // Typewriter effect: start typing when a new assistant message appears
  useEffect(() => {
    if (typingMessageIndex !== null && aiMessages[typingMessageIndex]) {
      const fullLength = aiMessages[typingMessageIndex].content.length;
      typingRef.current = setInterval(() => {
        setDisplayedChars(prev => {
          const next = prev + 3;
          if (next >= fullLength) {
            if (typingRef.current) clearInterval(typingRef.current);
            typingRef.current = null;
            setTypingMessageIndex(null);
            return fullLength;
          }
          return next;
        });
      }, 12);
      return () => {
        if (typingRef.current) {
          clearInterval(typingRef.current);
          typingRef.current = null;
        }
      };
    }
  }, [typingMessageIndex]);

  // Auto-scroll during typing
  useEffect(() => {
    if (typingMessageIndex !== null || isAILoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedChars, isAILoading, typingMessageIndex]);

  const skipTyping = () => {
    if (typingRef.current) clearInterval(typingRef.current);
    typingRef.current = null;
    if (typingMessageIndex !== null && aiMessages[typingMessageIndex]) {
      setDisplayedChars(aiMessages[typingMessageIndex].content.length);
    }
    setTypingMessageIndex(null);
  };

  // Reset collapsed state when inspected element changes
  useEffect(() => {
    setChartPreviewCollapsed(false);
  }, [elementContext?.fieldName]);
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');

          setAiInput(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          if (audioContextRef.current) {
            if ((audioContextRef.current as any).intervalId) {
              if (event.error !== 'not-allowed') {
                clearInterval((audioContextRef.current as any).intervalId);
                audioContextRef.current = null;
              }
            } else if (typeof audioContextRef.current.close === 'function') {
              audioContextRef.current.close();
              audioContextRef.current = null;
            }
          }

          if (event.error === 'not-allowed') {
            // Permission denied - keep UI open with simulated waveform
          } else if (event.error === 'network') {
            setIsRecording(false);
            alert('Network error. Please check your internet connection.');
          } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setIsRecording(false);
            console.warn('Speech recognition error:', event.error);
          }
        };

        recognitionRef.current.onend = () => {
          // Don't automatically close - user should manually close
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  // Animate audio waveform
  useEffect(() => {
    if (isRecording && analyserRef.current) {
      const updateAudioLevels = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          const bars = 30;
          const step = Math.floor(dataArray.length / bars);
          const levels = Array.from({ length: bars }, (_, i) => {
            const value = dataArray[i * step] / 255;
            return Math.max(0.1, value);
          });

          setAudioLevels(levels);
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
      };

      updateAudioLevels();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevels(new Array(30).fill(0.1));
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  const handleMicrophoneClick = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setShowTranscriptionText(false);

      if (audioContextRef.current) {
        if ((audioContextRef.current as any).intervalId) {
          clearInterval((audioContextRef.current as any).intervalId);
        } else {
          audioContextRef.current.close();
        }
        audioContextRef.current = null;
      }
    } else {
      setIsRecording(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
      } catch (err: any) {
        const simulateWaveform = () => {
          const levels = Array.from({ length: 30 }, () => {
            return Math.max(0.2, Math.random() * 0.8);
          });
          setAudioLevels(levels);
        };

        const intervalId = setInterval(simulateWaveform, 100);
        (audioContextRef as any).current = { intervalId };
      }

      try {
        recognitionRef.current.start();
      } catch (err: any) {
        // Don't close UI - let the simulated waveform continue
      }
    }
  };

  const handleCancelRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setShowTranscriptionText(false);
    setAiInput('');

    if (audioContextRef.current) {
      if ((audioContextRef.current as any).intervalId) {
        clearInterval((audioContextRef.current as any).intervalId);
      } else {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
  };

  const handleVoiceChatClick = () => {
    setIsVoiceChatActive(!isVoiceChatActive);
    if (!isVoiceChatActive) {
      if (recognitionRef.current) {
        setIsRecording(true);
        recognitionRef.current.start();
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAiInput(suggestion);
    // Use a timeout to allow the input state to update before sending
    setTimeout(() => {
      handleSendMessage(suggestion);
    }, 10);
  };

  const handleSendMessage = async (overrideInput?: string) => {
    const inputToSend = overrideInput || aiInput;
    if (inputToSend.trim()) {
      const userMessage = inputToSend.trim();
      // Clear previous suggestions from all previous messages to keep UI clean
      setAiMessages(prev => prev.map(m => ({ ...m, suggestions: undefined })));
      setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setAiInput('');

      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
        setShowTranscriptionText(false);

        if (audioContextRef.current) {
          if ((audioContextRef.current as any).intervalId) {
            clearInterval((audioContextRef.current as any).intervalId);
          } else if (typeof audioContextRef.current.close === 'function') {
            audioContextRef.current.close();
          }
          audioContextRef.current = null;
        }
      }

      try {
        setIsAILoading(true);
        const currentMessages = [...aiMessages, { role: 'user' as const, content: userMessage }];
        const aiResponse = await getAIResponse(currentMessages, {
          elementContext,
          dashboardConfig,
          dashboardData,
          activeView,
          clientName,
          selectedClient,
          allClients,
          allOpportunities,
        });

        // Apply dashboard actions if any
        if (aiResponse.actions.length > 0 && dashboardConfig && onDashboardConfigChange) {
          const result = applyAIActions(aiResponse.actions, dashboardConfig, dashboardData);
          onDashboardConfigChange(result.config);
          if (result.data && onDashboardDataChange) {
            onDashboardDataChange(result.data);
          }
        }

        const newMsg: Message = {
          role: 'assistant',
          content: aiResponse.message,
          suggestions: aiResponse.suggestions,
          navLinks: aiResponse.navLinks,
        };
        setAiMessages(prev => {
          const newIndex = prev.length;
          setDisplayedChars(0);
          setTypingMessageIndex(newIndex);
          return [...prev, newMsg];
        });
      } catch (error) {
        console.error('Error getting AI response:', error);
        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }]);
      } finally {
        setIsAILoading(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — hides during drag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isDragging ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={onClose}
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
          />

          {/* Drawer — slides out during drag to reveal elements */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: isDragging ? '100%' : 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] md:w-[600px] bg-white z-[71] flex flex-col shadow-lg"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-ai-600" />
                <h2 className="text-lg font-semibold">Chat with AVA</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAiMessages([]);
                    setAiInput('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                  aria-label="New Chat"
                >
                  <PenSquare className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                  aria-label="History"
                >
                  <History className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Chart Preview Panel */}
            {inspectedChart && (
              <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => setChartPreviewCollapsed(!chartPreviewCollapsed)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" />
                    {inspectedChart.title}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${chartPreviewCollapsed ? '-rotate-90' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {!chartPreviewCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <ChartWidget config={inspectedChart} data={chartPreviewData} compact idPrefix="preview-" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {aiMessages.length === 0 ? (
                /* Welcome Screen */
                <div className="flex flex-col items-start h-full px-4 pt-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Hi! I'm AVA, your AI assistant.{clientName ? ` Ask me anything about ${clientName}.` : ' Ask me anything about your clients.'}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mb-4">
                    I have access to all client data including mortgages, meetings, notes, and more.
                  </p>

                  {elementContext && !inspectedChart && (
                    <div className="bg-ai-50 border border-ai-200 rounded-lg px-3 py-2.5 mb-4 w-full max-w-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Crosshair className="w-3 h-3 text-ai-600" />
                        <span className="text-[10px] font-bold text-ai-700 uppercase tracking-wider">Inspecting</span>
                      </div>
                      <p className="text-xs font-semibold text-ai-900">{elementContext.label}</p>
                      {elementContext.section && (
                        <p className="text-[11px] text-ai-600 mt-0.5">Section: {elementContext.section}</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 max-w-sm">
                    {(() => {
                      const name = elementContext?.entityName;
                      const ref = name ? `"${name}"` : null;

                      const promptsByType: Record<string, string[]> = {
                        clientRecord: [
                          ref ? `Summarize ${ref}'s recent activity.` : 'Summarize this client.',
                          ref ? `What are the next steps for ${ref}?` : 'Show upcoming meetings.',
                          ref ? `Are there any active opportunities for ${ref}?` : 'Check mortgage status.',
                          ref ? `Draft a check-in email for ${ref}.` : 'Recent notes history.',
                        ],
                        activityRecord: [
                          ref ? `Generate prep notes for ${ref}.` : 'Generate prep notes.',
                          ref ? `Draft a follow-up email for ${ref}.` : 'Draft a follow-up email.',
                          ref ? `Summarize ${ref}.` : 'Summarize this activity.',
                          ref ? `Create a task related to ${ref}.` : 'Create a related task.',
                        ],
                        opportunityRecord: [
                          ref ? `What is the status of ${ref}?` : 'What is the status?',
                          ref ? `Summarize recent interactions for ${ref}.` : 'Summarize recent interactions.',
                          ref ? `Draft a proposal update for ${ref}.` : 'Draft a proposal update.',
                          ref ? `What are the next steps to close ${ref}?` : 'What are the next steps to close?',
                        ],
                        meetingRecord: [
                          ref ? `Generate a summary of ${ref}.` : 'Generate a meeting summary.',
                          ref ? `List action items from ${ref}.` : 'List action items.',
                          ref ? `Draft a follow-up email about ${ref}.` : 'Draft a follow-up email.',
                          ref ? `Who attended ${ref}?` : 'Who attended?',
                        ],
                      };

                      // If an element was dragged, use its prompts — otherwise fall back to current view
                      const viewSuggestions: Record<string, string[]> = {
                        // Main menu views
                        dashboard: [
                          'Summarize today\'s key tasks and meetings.',
                          'Which clients need attention this week?',
                          'Show me overdue tasks.',
                          'What opportunities are closing soon?',
                        ],
                        clients: [
                          'Which clients haven\'t been contacted recently?',
                          'Show clients with upcoming reviews.',
                          'Who has the most active opportunities?',
                          'List clients by risk level.',
                        ],
                        opportunities: [
                          'Which opportunities are at risk of closing?',
                          'Summarise the pipeline by stage.',
                          'What are the highest-value opportunities?',
                          'Which opportunities need follow-up today?',
                        ],
                        inbox: [
                          'Summarise unread messages.',
                          'Are there any urgent emails from clients?',
                          'Draft a reply to the latest message.',
                          'Show messages from this week.',
                        ],
                        tasks: [
                          'What tasks are overdue?',
                          'Summarise today\'s tasks.',
                          'Which tasks are high priority?',
                          'Create a task for a client follow-up.',
                        ],
                        calendar: [
                          'What meetings do I have today?',
                          'Show upcoming client reviews this week.',
                          'Summarise my schedule for the next 7 days.',
                          'Find a free slot for a client meeting.',
                        ],
                        marketing: [
                          'Summarise recent campaign performance.',
                          'Which clients should I target for a new campaign?',
                          'Draft a newsletter for mortgage clients.',
                          'Show engagement metrics.',
                        ],
                        contacts: [
                          'Show recently added contacts.',
                          'Which contacts have no assigned advisor?',
                          'Find contacts with upcoming birthdays.',
                          'Search for a contact by company.',
                        ],
                        reporting: [
                          'Show revenue performance for this month.',
                          'Which advisor has the most closed deals?',
                          'Summarise client growth over the past quarter.',
                          'What is the conversion rate for new leads?',
                        ],
                        // Client sub-tabs
                        overview: [
                          clientName ? `Summarise ${clientName}'s portfolio.` : 'Summarise this client\'s portfolio.',
                          clientName ? `What are the next steps for ${clientName}?` : 'What are the next steps?',
                          clientName ? `Are there active opportunities for ${clientName}?` : 'Are there active opportunities?',
                          clientName ? `Draft a check-in email for ${clientName}.` : 'Draft a check-in email.',
                        ],
                        meetings: [
                          clientName ? `List upcoming meetings with ${clientName}.` : 'List upcoming meetings.',
                          'Generate notes for the last meeting.',
                          'Draft a follow-up email from the last meeting.',
                          'Schedule a new meeting.',
                        ],
                        notes: [
                          'Show the most recent notes.',
                          'Summarise all notes for this client.',
                          'Are there any action items in the notes?',
                          'Create a new note.',
                        ],
                        onboarding: [
                          'What onboarding steps are incomplete?',
                          'Summarise client information collected so far.',
                          'What documents are still needed?',
                          'Generate a fact-find summary.',
                        ],
                        financials: [
                          'Summarise the financial position.',
                          'What are the key financial risks?',
                          'Show a cashflow overview.',
                          'Are there any outstanding liabilities?',
                        ],
                        communication: [
                          'Show the latest correspondence.',
                          'Summarise recent email threads.',
                          'Draft a follow-up message.',
                          'What communications are overdue?',
                        ],
                        documents: [
                          'List recently added documents.',
                          'Are there any unsigned documents?',
                          'Find the latest statement of advice.',
                          'What documents are missing?',
                        ],
                      };

                      const starters = (elementContext?.fieldName && promptsByType[elementContext.fieldName])
                        || (activeView && viewSuggestions[activeView])
                        || ['Summarise this client', 'Show upcoming meetings', 'Check mortgage status', 'Recent notes history'];

                      return starters.map((starter, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(starter)}
                          className="px-3 py-1.5 bg-ai-50 border border-ai-100 text-ai-700 text-xs font-medium rounded-full hover:bg-ai-100 hover:border-ai-200 transition-colors shadow-sm"
                        >
                          {starter}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              ) : (
                /* Messages List */
                <div className="space-y-4">
                  {aiMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-ai-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-ai-600" />
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded max-w-[80%] ${message.role === 'user'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-ai-50 border border-ai-100 text-gray-800'
                          }${index === typingMessageIndex ? ' cursor-pointer' : ''}`}
                        onClick={index === typingMessageIndex ? skipTyping : undefined}
                      >
                        {message.role === 'assistant' ? (
                          <div className="text-sm prose prose-sm max-w-none prose-headings:text-[13px] prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-3 prose-p:leading-relaxed prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-1 prose-strong:font-semibold prose-strong:text-gray-900 first:prose-headings:mt-0">
                            <ReactMarkdown
                              components={{
                                a: ({ href, children }) => {
                                  // Client links: #client:123
                                  const clientMatch = href?.match(/^#client:(\d+)$/);
                                  if (clientMatch && onClientClick) {
                                    return (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onClientClick(parseInt(clientMatch[1])); }}
                                        className="underline decoration-ai-300 hover:decoration-ai-600 cursor-pointer transition-colors text-ai-700 font-medium"
                                      >
                                        {children}
                                      </button>
                                    );
                                  }
                                  // Action buttons: action:add-event, action:send-email, etc.
                                  const actionMatch = href?.match(/^action:(.+)$/);
                                  if (actionMatch && onAction) {
                                    const actionId = actionMatch[1];
                                    const IconComp = ACTION_ICONS[actionId];
                                    return (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onAction(actionId); }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1 bg-white border border-ai-200 text-ai-700 text-xs font-medium rounded-lg hover:bg-ai-50 hover:border-ai-300 transition-colors shadow-sm"
                                      >
                                        {IconComp && <IconComp className="w-3.5 h-3.5" />}
                                        {children}
                                      </button>
                                    );
                                  }
                                  // Inline charts: chart:revenueData:area
                                  const chartMatch = href?.match(/^chart:(\w+)(?::(\w+))?$/);
                                  if (chartMatch && dashboardData) {
                                    const [, dataSource, chartType] = chartMatch;
                                    const series = INLINE_CHART_SERIES[dataSource];
                                    if (series) {
                                      const inlineConfig: ChartWidgetConfig = {
                                        id: `inline-${index}-${dataSource}`,
                                        type: 'chart',
                                        chartType: (chartType as any) || 'area',
                                        title: '',
                                        subtitle: '',
                                        visible: true,
                                        dataSource,
                                        series,
                                        colors: {},
                                        colSpan: 1,
                                        order: 0,
                                      };
                                      const chartData = resolveChartData(dataSource, dashboardData);
                                      return (
                                        <div className="my-3 rounded-lg border border-ai-100 bg-white p-2 -mx-1" onClick={(e) => e.stopPropagation()}>
                                          <ChartWidget config={inlineConfig} data={chartData} compact idPrefix={`msg-${index}-`} />
                                        </div>
                                      );
                                    }
                                  }
                                  return <a href={href}>{children}</a>;
                                },
                                table: ({ children }) => (
                                  <div className="my-3 overflow-x-auto rounded-lg border border-ai-100 -mx-1">
                                    <table className="min-w-full text-xs">{children}</table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-ai-50/50 border-b border-ai-100">{children}</thead>
                                ),
                                th: ({ children }) => (
                                  <th className="px-3 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">{children}</th>
                                ),
                                td: ({ children }) => (
                                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap border-t border-ai-50">{children}</td>
                                ),
                              }}
                            >
                              {autoLinkClients(
                                index === typingMessageIndex
                                  ? message.content.slice(0, displayedChars)
                                  : message.content,
                                allClients || []
                              )}
                            </ReactMarkdown>
                            {index === typingMessageIndex && (
                              <span className="inline-block w-0.5 h-4 bg-ai-600 ml-0.5 animate-pulse align-middle" />
                            )}
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircle className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Thinking indicator */}
                  {isAILoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-ai-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-ai-600" />
                      </div>
                      <div className="px-4 py-3 rounded bg-ai-50 border border-ai-100 flex items-center gap-1.5">
                        {[0, 1, 2].map(i => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 bg-ai-400 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nav links for the most recent message */}
                  {typingMessageIndex === null && aiMessages.length > 0 && aiMessages[aiMessages.length - 1].role === 'assistant' && aiMessages[aiMessages.length - 1].navLinks && onNavigateTab && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap gap-1.5 ml-11 mt-2"
                    >
                      {aiMessages[aiMessages.length - 1].navLinks?.map((link) => {
                        const Icon = NAV_TAB_ICONS[link.tabId];
                        if (!Icon) return null;
                        return (
                          <button
                            key={link.tabId}
                            onClick={() => onNavigateTab(link.tabId)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-ai-50 hover:bg-ai-100 text-ai-700 text-xs font-medium rounded-md transition-colors border border-ai-200 hover:border-ai-300"
                            title={link.label}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {link.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Suggestions for the most recent message */}
                  {typingMessageIndex === null && aiMessages.length > 0 && aiMessages[aiMessages.length - 1].role === 'assistant' && aiMessages[aiMessages.length - 1].suggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap gap-2 ml-11 mt-2"
                    >
                      {aiMessages[aiMessages.length - 1].suggestions?.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 bg-white border border-ai-200 text-ai-700 text-sm font-medium rounded-full hover:bg-ai-50 hover:border-ai-300 transition-colors shadow-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 pl-16 sm:pl-12 pr-4 py-4 relative">
              {/* Voice Recording Overlay */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 bottom-0 top-[-100px] bg-gray-900/95 backdrop-blur-xl z-10 flex flex-col justify-end"
                  >
                    {aiInput && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pt-4 pb-3 text-white text-center text-base leading-relaxed"
                      >
                        {aiInput}
                      </motion.div>
                    )}

                    <div className="flex items-center gap-4 px-4 pb-8">
                      <button
                        onClick={handleCancelRecording}
                        className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Cancel"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>

                      <div className="flex-1 flex items-center justify-center gap-[2px] h-12">
                        {audioLevels.map((level, index) => (
                          <motion.div
                            key={index}
                            className="w-[2px] bg-gray-400 rounded-full"
                            animate={{
                              height: `${level * 40}px`,
                            }}
                            transition={{
                              duration: 0.1,
                              ease: 'linear'
                            }}
                            style={{
                              minHeight: '4px',
                            }}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => handleSendMessage()}
                        className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Send"
                      >
                        <ArrowUp className="w-6 h-6 text-gray-900" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Normal input area */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && aiInput.trim()) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask AVA for help..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ai-500 focus:border-transparent"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {aiInput.trim() ? (
                    <motion.button
                      key="send"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: 'easeInOut' }}
                      onClick={() => handleSendMessage()}
                      className="w-12 h-12 bg-ai-600 rounded-full flex items-center justify-center hover:bg-ai-700 transition-colors flex-shrink-0"
                      aria-label="Send Message"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </motion.button>
                  ) : (
                    <motion.div
                      key="voice-buttons"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: 'easeInOut' }}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={handleMicrophoneClick}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${isRecording && !isVoiceChatActive
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-ai-600 hover:bg-ai-700'
                          }`}
                        aria-label="Voice Input"
                      >
                        <Mic className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={handleVoiceChatClick}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${isVoiceChatActive
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-orange-500 hover:bg-orange-600'
                          }`}
                        aria-label="Audio Input"
                      >
                        <AudioLines className="w-5 h-5 text-white" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
