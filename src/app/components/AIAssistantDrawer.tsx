import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIResponse, type Message, type AIAction } from '../utils/openai';
import { DEFAULT_DASHBOARD_CONFIG, type DashboardConfig, type ChartWidgetConfig } from '../data/dashboardConfig';
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
} from 'lucide-react';
import { useAIDrag, type AIElementContext } from './AIDragToInspect';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  elementContext?: AIElementContext;
  dashboardConfig?: DashboardConfig;
  onDashboardConfigChange?: (config: DashboardConfig) => void;
  activeView?: string;
  clientName?: string;
}

function applyAIActions(actions: AIAction[], config: DashboardConfig): DashboardConfig {
  let newConfig = { ...config, widgets: [...config.widgets] };

  for (const action of actions) {
    switch (action.functionName) {
      case 'update_widget': {
        const { widgetId, changes } = action.args;
        newConfig.widgets = newConfig.widgets.map(w => {
          if (w.id !== widgetId) return w;
          // Deep merge series if provided
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
    }
  }

  return newConfig;
}

export function AIAssistantDrawer({ isOpen, onClose, elementContext, dashboardConfig, onDashboardConfigChange, activeView, clientName }: AIAssistantDrawerProps) {
  const { isDragging } = useAIDrag();
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [showTranscriptionText, setShowTranscriptionText] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(30).fill(0));
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
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
          activeView,
          clientName,
        });

        // Apply dashboard actions if any
        if (aiResponse.actions.length > 0 && dashboardConfig && onDashboardConfigChange) {
          const newConfig = applyAIActions(aiResponse.actions, dashboardConfig);
          onDashboardConfigChange(newConfig);
        }

        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: aiResponse.message,
          suggestions: aiResponse.suggestions,
        }]);
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
                <div className="w-10 h-6" aria-hidden="true" /> {/* Space for docking AI orb */}
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

            {/* Element Context Banner (from drag-to-inspect) */}
            {elementContext && (
              <div className="bg-ai-100 border-b border-ai-300 px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Crosshair className="w-3.5 h-3.5 text-ai-700" />
                  <span className="text-xs font-bold text-ai-800 uppercase tracking-wider">Inspecting Element</span>
                </div>
                <p className="text-sm font-semibold text-ai-900">{elementContext.label}</p>
                {elementContext.section && (
                  <p className="text-xs text-ai-700 mt-0.5">Section: {elementContext.section}</p>
                )}
                {elementContext.value && (
                  <p className="text-xs text-ai-700 mt-0.5">Current value: <span className="font-medium">{elementContext.value}</span></p>
                )}
                {elementContext.editable && (
                  <p className="text-[10px] text-ai-600 mt-1 font-medium">This field can be updated via AI</p>
                )}
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {aiMessages.length === 0 ? (
                /* Welcome Screen */
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <div className="bg-ai-100 rounded-full p-6 mb-6">
                    <Sparkles className="w-12 h-12 text-ai-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                    Hi! I'm AVA, your AI assistant.{clientName ? ` Ask me anything about ${clientName}.` : ' Ask me anything about your clients.'}
                  </h3>
                  <p className="text-sm text-gray-600 text-center max-w-md mb-8">
                    I have access to all client data including mortgages, meetings, notes, and more.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 max-w-md">
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
                          className="px-4 py-2 bg-ai-50 border border-ai-100 text-ai-700 text-sm font-medium rounded-full hover:bg-ai-100 hover:border-ai-200 transition-colors shadow-sm"
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
                          : 'bg-ai-600 text-white'
                          }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="text-sm prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
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

                  {/* Suggestions for the most recent message */}
                  {aiMessages.length > 0 && aiMessages[aiMessages.length - 1].role === 'assistant' && aiMessages[aiMessages.length - 1].suggestions && (
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
