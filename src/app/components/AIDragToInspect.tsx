import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';

// === Types ===
export interface AIElementContext {
  label: string;
  fieldName: string;
  value: string;
  section: string;
  editable: boolean;
  tagName: string;
}

interface AIDragContextType {
  selectedElement: AIElementContext | null;
  clearSelection: () => void;
  isDragging: boolean;
  setActions: (actions: React.ReactNode) => void;
  openAI: (context?: AIElementContext) => void;
}

// === Context ===
const AIDragContext = createContext<AIDragContextType>({
  selectedElement: null,
  clearSelection: () => { },
  isDragging: false,
  setActions: () => { },
  openAI: () => { },
});

export const useAIDrag = () => useContext(AIDragContext);

// === Helper: find nearest AI-annotated ancestor ===
function findAITarget(el: Element | null): { element: HTMLElement; info: AIElementContext } | null {
  let current = el as HTMLElement | null;
  while (current && current !== document.body) {
    const field = current.getAttribute('data-ai-field');
    const section = current.getAttribute('data-ai-section');
    if (field || section) {
      const info: AIElementContext = {
        label: current.getAttribute('data-ai-label') || field || section || '',
        fieldName: field || '',
        value: '',
        section: section || findParentSection(current) || '',
        editable: current.getAttribute('data-ai-editable') === 'true',
        tagName: current.tagName.toLowerCase(),
      };
      // Try to extract current value
      if (current instanceof HTMLInputElement || current instanceof HTMLSelectElement || current instanceof HTMLTextAreaElement) {
        info.value = current.value;
      } else {
        const input = current.querySelector('input, select, textarea') as HTMLInputElement | null;
        if (input) info.value = input.value;
      }
      return { element: current, info };
    }
    current = current.parentElement;
  }
  return null;
}

function findParentSection(el: HTMLElement): string {
  let current = el.parentElement;
  while (current && current !== document.body) {
    const section = current.getAttribute('data-ai-section');
    if (section) return section;
    current = current.parentElement;
  }
  return '';
}

// === Main Provider Component ===
interface AIDragProviderProps {
  children: React.ReactNode;
  onOpenAI: (elementContext?: AIElementContext) => void;
  showButton: boolean;
  isDrawerOpen?: boolean;
}

export function AIDragProvider({ children, onOpenAI, showButton, isDrawerOpen }: AIDragProviderProps) {
  const [selectedElement, setSelectedElement] = useState<AIElementContext | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRippling, setIsRippling] = useState(false);
  const [currentActions, setCurrentActions] = useState<React.ReactNode>(null);

  const triggerRipple = useCallback(() => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
  }, []);

  // ... (previous refs and state remain same)
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const liquidOverlayRef = useRef<HTMLDivElement>(null);
  const buttonBlobRef = useRef<HTMLDivElement>(null);
  const ghostBlobRef = useRef<HTMLDivElement>(null);
  const buttonBgRef = useRef<HTMLDivElement>(null);

  const dragState = useRef({
    active: false,
    buttonCenter: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    hasDetached: false,
    highlightedEl: null as HTMLElement | null,
    elementInfo: null as AIElementContext | null,
    moved: false,
  });

  const DETACH_DISTANCE = 70;

  // Track window width for drawer-edge positioning
  const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute button right offset: normal position or drawer-edge
  // Compute positions: AI Orb docks to drawer header, while Actions stay centered in page area
  const positionStyles = useMemo(() => {
    const isMobile = windowWidth < 640;
    const drawerWidth = windowWidth >= 768 ? 600 : 500;

    if (isDrawerOpen && !isMobile) {
      // Dock to Drawer Header (replaces the static Sparkles icon)
      return {
        left: `${windowWidth - drawerWidth + 30}px`,
        top: '32px',
        bottom: 'auto',
        transform: 'translate(-50%, -50%) scale(0.65)',
        zIndex: 100,
      };
    }

    // Default centered at bottom
    return {
      left: '50%',
      bottom: '16px',
      top: 'auto',
      transform: 'translateX(-50%) scale(1)',
      opacity: 1,
      pointerEvents: 'auto',
      zIndex: 50,
    };
  }, [isDrawerOpen, windowWidth]);

  // Actions should take the "available" page center when drawer is open
  const actionsPosition = useMemo(() => {
    const isMobile = windowWidth < 640;
    const drawerWidth = windowWidth >= 768 ? 600 : 500;

    if (isDrawerOpen && !isMobile) {
      const remainingWidth = windowWidth - drawerWidth;
      return {
        left: `${remainingWidth / 2}px`,
        transform: 'translateX(-50%)',
      };
    }

    return {
      left: '50%',
      transform: 'translateX(-50%)',
    };
  }, [isDrawerOpen, windowWidth]);

  // Clean up highlight styles on an element
  const clearHighlight = useCallback(() => {
    const state = dragState.current;
    if (state.highlightedEl) {
      state.highlightedEl.style.outline = '';
      state.highlightedEl.style.outlineOffset = '';
      state.highlightedEl.style.boxShadow = '';
      state.highlightedEl.style.transition = '';
      state.highlightedEl = null;
      state.elementInfo = null;
    }
    if (labelRef.current) {
      labelRef.current.style.opacity = '0';
    }
  }, []);

  // Start drag on pointer down
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    dragState.current = {
      active: true,
      buttonCenter: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      startPos: { x: e.clientX, y: e.clientY },
      currentPos: { x: e.clientX, y: e.clientY },
      hasDetached: false,
      highlightedEl: null,
      elementInfo: null,
      moved: false,
    };

    setIsDragging(true);
  }, []);

  // Document-level pointer move/up during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: PointerEvent) => {
      const state = dragState.current;
      if (!state.active) return;

      state.currentPos = { x: e.clientX, y: e.clientY };
      const dx = e.clientX - state.buttonCenter.x;
      const dy = e.clientY - state.buttonCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Detect meaningful drag vs click
      const totalMove = Math.sqrt(
        (e.clientX - state.startPos.x) ** 2 + (e.clientY - state.startPos.y) ** 2
      );
      if (totalMove > 5) state.moved = true;

      // === Detach threshold ===
      if (!state.hasDetached && dist > DETACH_DISTANCE) {
        state.hasDetached = true;
        // Button spring-back with overshoot
        if (buttonRef.current) {
          buttonRef.current.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          buttonRef.current.style.transform = 'scale(0.85)';
          setTimeout(() => {
            if (buttonRef.current) {
              buttonRef.current.style.transform = 'scale(1)';
            }
          }, 120);
        }
      }

      // === Update ghost position ===
      if (ghostRef.current) {
        // Keeping icon visible immediately upon movement
        const opacity = state.hasDetached ? 1 : Math.min(1, dist / 5);
        // Remove scale(0) starting point to prevent disappearing
        const scale = state.hasDetached ? 1 : Math.max(0.6, 0.6 + (dist / DETACH_DISTANCE) * 0.4);

        ghostRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(${scale})`;
        ghostRef.current.style.opacity = String(opacity);

        // Dynamic shadow and border
        const detachFactor = Math.min(1, dist / (DETACH_DISTANCE * 0.8));
        ghostRef.current.style.boxShadow = `0 0 ${20 * detachFactor}px rgba(147, 51, 234, ${0.4 * detachFactor}), 0 ${6 * detachFactor}px ${24 * detachFactor}px rgba(0, 0, 0, ${0.15 * detachFactor})`;
        ghostRef.current.style.borderColor = `rgba(229, 231, 235, ${detachFactor})`;
      }

      // === Update Liquid Blobs (Gooey effect) ===
      if (buttonBlobRef.current && ghostBlobRef.current && liquidOverlayRef.current) {
        if (!state.hasDetached) {
          liquidOverlayRef.current.style.opacity = '1';

          const bRect = buttonRef.current?.getBoundingClientRect();
          if (bRect) {
            const bx = bRect.left + bRect.width / 2;
            const by = bRect.top + bRect.height / 2;
            buttonBlobRef.current.style.transform = `translate(${bx}px, ${by}px) translate(-50%, -50%) scale(1.1)`;
            buttonBlobRef.current.style.width = `${bRect.width}px`;
            buttonBlobRef.current.style.height = `${bRect.height}px`;
          }

          ghostBlobRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(1.1)`;
          ghostBlobRef.current.style.opacity = '1';
        } else {
          // Bounce back to circle immediately on detachment
          if (liquidOverlayRef.current.style.opacity !== '0') {
            liquidOverlayRef.current.style.opacity = '0';
            if (buttonBgRef.current) {
              buttonBgRef.current.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
              buttonBgRef.current.style.transform = 'scale(1)';
            }
          }
        }
      }

      // === Button deformation (before detach) ===
      if (buttonBgRef.current && !state.hasDetached) {
        const pullFactor = Math.min(0.2, dist / 400);
        const angle = Math.atan2(dy, dx);
        const squish = 1 + Math.min(0.3, dist / 250);

        buttonBgRef.current.style.transform = [
          `translate(${Math.cos(angle) * dist * pullFactor}px, ${Math.sin(angle) * dist * pullFactor}px)`,
          `rotate(${angle}rad)`,
          `scaleX(${squish})`,
          `scaleY(${1 / squish})`,
          `rotate(${-angle}rad)`,
        ].join(' ');
      }

      // === Element detection ===
      // Temporarily hide overlay so elementFromPoint sees through it
      if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none';
      const elUnder = document.elementFromPoint(e.clientX, e.clientY);
      if (overlayRef.current) overlayRef.current.style.pointerEvents = '';

      // Ignore the button itself
      if (elUnder === buttonRef.current || buttonRef.current?.contains(elUnder as Node)) {
        clearHighlight();
        return;
      }

      const target = findAITarget(elUnder);
      if (target && target.element !== state.highlightedEl) {
        clearHighlight();
        state.highlightedEl = target.element;
        state.elementInfo = target.info;
        target.element.style.transition = 'outline 0.15s, box-shadow 0.15s';
        target.element.style.outline = '2px solid #9333ea';
        target.element.style.outlineOffset = '3px';
        target.element.style.boxShadow = '0 0 0 6px rgba(147, 51, 234, 0.1), 0 0 20px rgba(147, 51, 234, 0.15)';

        // Show label near ghost
        if (labelRef.current) {
          labelRef.current.textContent = target.info.label;
          labelRef.current.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 20}px)`;
          labelRef.current.style.opacity = '1';
        }
      } else if (!target) {
        clearHighlight();
      } else if (target && labelRef.current) {
        // Same element, just update label position
        labelRef.current.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 20}px)`;
      }
    };

    const handleUp = (_e: PointerEvent) => {
      const state = dragState.current;
      if (!state.active) return;
      state.active = false;

      // Reset button transform
      if (buttonBgRef.current && state.moved) {
        buttonBgRef.current.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        buttonBgRef.current.style.transform = '';
        setTimeout(() => {
          if (buttonBgRef.current) buttonBgRef.current.style.transition = '';
        }, 500);
      }

      // Hide label
      if (labelRef.current) {
        labelRef.current.style.opacity = '0';
      }

      // Decide outcome
      // ONLY trigger Case 1 (Open with context) if it's a FIELD.
      // Sections are treated as background and zip back unless it was a click.
      const isTargetField = state.highlightedEl && state.elementInfo?.fieldName;

      if (isTargetField && state.elementInfo && state.moved) {
        const info = { ...state.elementInfo };
        const el = state.highlightedEl!;

        // Flash highlight then clean up
        el.style.outline = '2px solid #7c3aed';
        el.style.boxShadow = '0 0 0 6px rgba(124, 58, 237, 0.2), 0 0 30px rgba(124, 58, 237, 0.2)';
        setTimeout(() => {
          el.style.outline = '';
          el.style.outlineOffset = '';
          el.style.boxShadow = '';
          el.style.transition = '';
        }, 800);

        state.highlightedEl = null;
        state.elementInfo = null;
        setSelectedElement(info);
        setIsDragging(false);
        onOpenAI(info); // SUCCESS: Drag to Field -> OPEN
      } else {
        clearHighlight();

        // Case 2: Moved far but hit Nothing (or just a background section) -> ZIP BACK
        if (state.moved && ghostRef.current && buttonRef.current) {
          const ghost = ghostRef.current;
          const button = buttonRef.current;
          const buttonRect = button.getBoundingClientRect();
          const bx = buttonRect.left + buttonRect.width / 2;
          const by = buttonRect.top + buttonRect.height / 2;

          ghost.style.transition = 'none';
          ghost.style.opacity = '1';
          ghost.style.transform = `translate(${state.currentPos.x}px, ${state.currentPos.y}px) translate(-50%, -50%) scale(1)`;
          ghost.offsetHeight;

          const ghostBlob = ghostBlobRef.current;
          if (ghostBlob) {
            ghostBlob.style.transition = 'transform 0.45s cubic-bezier(0.2, 0, 0, 1.2), opacity 0.1s ease-in 0.35s';
            ghostBlob.style.transform = `translate(${bx}px, ${by}px) translate(-50%, -50%) scale(0)`;
            ghostBlob.style.opacity = '0';
          }

          ghost.style.transition = 'transform 0.45s cubic-bezier(0.2, 0, 0, 1.2), opacity 0.1s ease-in 0.35s';
          ghost.style.transform = `translate(${bx}px, ${by}px) translate(-50%, -50%) scale(0)`;
          ghost.style.opacity = '0';

          setTimeout(() => {
            if (buttonBgRef.current) {
              buttonBgRef.current.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
              buttonBgRef.current.style.transform = 'scale(1.28)';
              setTimeout(() => {
                if (buttonBgRef.current) {
                  buttonBgRef.current.style.transform = 'scale(1)';
                  setTimeout(() => { if (buttonBgRef.current) buttonBgRef.current.style.transition = ''; }, 450);
                }
              }, 160);
            }
            if (liquidOverlayRef.current) liquidOverlayRef.current.style.opacity = '0';
            triggerRipple();
            setIsDragging(false);
          }, 400);
        } else {
          // Case 3: Simple Click (didn't move much) -> OPEN normally
          setIsDragging(false);
          triggerRipple();
          if (!state.moved) {
            onOpenAI();
          }
        }
      }
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, clearHighlight, onOpenAI]);

  const clearSelection = useCallback(() => setSelectedElement(null), []);

  return (
    <AIDragContext.Provider value={{ selectedElement, clearSelection, isDragging, setActions: setCurrentActions, openAI: onOpenAI }}>
      {children}

      {/* Supplementary actions (Quick Actions, Views, etc) - Stays centered in Page area */}
      <div
        className="fixed bottom-4 lg:bottom-3 z-40 pointer-events-none"
        style={{
          ...actionsPosition,
          transition: 'left 0.4s cubic-bezier(0.2, 0, 0, 1.2)',
        }}
      >
        <div className="pointer-events-auto flex items-center gap-3">
          {currentActions}
        </div>
      </div>

      {/* Floating AI Button Container - Docks to Drawer or Centers at Bottom */}
      <div
        className="fixed pointer-events-none"
        style={{
          ...positionStyles,
          opacity: (isDrawerOpen || isDragging) ? 1 : positionStyles.opacity,
          pointerEvents: (isDrawerOpen || isDragging) ? 'auto' : 'none',
          transition: 'all 0.5s cubic-bezier(0.2, 0, 0, 1.2), opacity 0.3s ease-in-out',
        }}
      >
        <div className="pointer-events-auto">
          {showButton && (
            <button
              ref={buttonRef}
              onPointerDown={handlePointerDown}
              className={`group relative w-14 h-14 flex items-center justify-center select-none touch-none cursor-grab active:cursor-grabbing ${isDrawerOpen ? 'z-[72]' : 'z-50'
                }`}
              aria-label="AI Assistant — click to chat, drag to inspect"
            >
              {/* Pulse Rings - Visual Affordance for Draggability (Hover or Triggered Ripple) */}
              {!isDragging && (
                <>
                  <div className="absolute inset-0 pointer-events-none group-hover:block hidden">
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-0 animate-[ai-orb-ripple_2.5s_infinite]" />
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-0 animate-[ai-orb-ripple_2.5s_infinite_1.2s]" />
                  </div>
                  {isRippling && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 border-2 border-purple-400 opacity-0 animate-[ai-wobble-ripple_1s_ease-out]" />
                      <div className="absolute inset-0 border-2 border-purple-300 opacity-0 animate-[ai-wobble-inner_0.8s_ease-out_0.1s]" />
                    </div>
                  )}
                </>
              )}

              {/* Deforming Background */}
              <div
                ref={buttonBgRef}
                className="absolute inset-0 bg-white rounded-full shadow-lg border border-gray-200"
                style={{ willChange: 'transform' }}
              />

              {/* Persistent Circular Icon */}
              <div className="relative z-10 pointer-events-none">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Global highlights and animations */}
      <style>
        {`
          @keyframes ai-orb-ripple {
            0% { transform: scale(1); opacity: 0.3; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          
          @keyframes ai-wobble-ripple {
            0% { transform: scale(1) rotate(0deg); opacity: 0.6; border-radius: 45% 55% 50% 50% / 50% 50% 45% 55%; }
            50% { transform: scale(1.5) rotate(180deg); opacity: 0.3; border-radius: 55% 45% 50% 50% / 45% 55% 55% 45%; }
            100% { transform: scale(2.2) rotate(360deg); opacity: 0; border-radius: 50%; }
          }

          @keyframes ai-wobble-inner {
            0% { transform: scale(1) rotate(0deg); opacity: 0.4; border-radius: 50% 50% 45% 55% / 45% 55% 50% 50%; }
            100% { transform: scale(1.8) rotate(-180deg); opacity: 0; border-radius: 50%; }
          }
          
          ${isDragging ? `
            [data-ai-field] {
              outline: 2px solid rgba(168, 85, 247, 0.4) !important;
              outline-offset: 2px !important;
              background-color: rgba(168, 85, 247, 0.03) !important;
              border-radius: 4px !important;
              transition: all 0.2s ease-in-out !important;
            }
            [data-ai-section] {
              outline: 1px dashed rgba(168, 85, 247, 0.2) !important;
              outline-offset: 4px !important;
            }
          ` : ''}
        `}
      </style>

      {/* Drag overlay — z above drawer when drawer is open */}
      {isDragging && (
        <div
          ref={overlayRef}
          className={`fixed inset-0 select-none touch-none ${isDrawerOpen ? 'z-[73]' : 'z-[55]'}`}
          style={{ cursor: 'grabbing' }}
        >
          {/* Liquid bridge layer (gooey bits) */}
          <div
            ref={liquidOverlayRef}
            className="absolute inset-0 pointer-events-none transition-opacity duration-150"
            style={{
              filter: 'url(#ai-liquid-goo) drop-shadow(0 4px 12px rgba(147, 51, 234, 0.2))',
              opacity: 0
            }}
          >
            <div
              ref={buttonBlobRef}
              className="absolute bg-white rounded-full"
              style={{ willChange: 'transform' }}
            />
            <div
              ref={ghostBlobRef}
              className="absolute w-10 h-10 bg-white rounded-full"
              style={{ willChange: 'transform' }}
            />
          </div>

          {/* Ghost orb (visible during drag and snap-back) */}
          <div
            ref={ghostRef}
            className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white rounded-full border border-gray-200"
            style={{
              pointerEvents: 'none',
              opacity: 0,
              boxShadow: '0 0 16px rgba(147, 51, 234, 0.3), 0 4px 20px rgba(0, 0, 0, 0.1)',
              willChange: 'transform, opacity',
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>

          {/* Target label tooltip */}
          <div
            ref={labelRef}
            className="absolute left-0 top-0 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-full shadow-lg whitespace-nowrap"
            style={{
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 0.15s',
              willChange: 'transform, opacity',
            }}
          />
        </div>
      )}

      {/* SVG Filter for Liquid Effect */}
      <svg className="fixed h-0 w-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="ai-liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" result="goo" />
          </filter>
        </defs>
      </svg>
    </AIDragContext.Provider>
  );
}
