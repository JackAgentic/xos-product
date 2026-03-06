import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIResponse, type Message } from '../utils/openai';
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
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantDrawer({ isOpen, onClose }: AIAssistantDrawerProps) {
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

  const handleSendMessage = async () => {
    if (aiInput.trim()) {
      const userMessage = aiInput.trim();
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
        const aiResponse = await getAIResponse(currentMessages);

        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: aiResponse
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] md:w-[600px] bg-white z-[71] flex flex-col shadow-lg"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {aiMessages.length === 0 ? (
                /* Welcome Screen */
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <div className="bg-purple-100 rounded-full p-6 mb-6">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                    Hi! I'm AVA, your AI assistant. Ask me anything about Another Client.
                  </h3>
                  <p className="text-sm text-gray-600 text-center max-w-md">
                    I have access to all client data including mortgages, meetings, notes, and more.
                  </p>
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
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-purple-600 text-white'
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
                </div>
              )}
            </div>

            {/* Context Banner */}
            <div className="bg-purple-50 border-t border-purple-200 px-4 py-3">
              <p className="text-xs text-purple-900">
                <span className="font-medium">This chat relates to Another Client.</span> AVA has access to all client data including mortgages, insurance, meetings, notes, KiwiSaver plans, and more.
              </p>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 px-4 py-4 relative">
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
                        onClick={handleSendMessage}
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
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      onClick={handleSendMessage}
                      className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors flex-shrink-0"
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
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                          isRecording && !isVoiceChatActive
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                        aria-label="Voice Input"
                      >
                        <Mic className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={handleVoiceChatClick}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                          isVoiceChatActive
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
