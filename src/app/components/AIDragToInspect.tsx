import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Sparkles, X } from 'lucide-react';

// === Types ===
export interface AIElementContext {
  label: string;
  fieldName: string;
  value: string;
  section: string;
  editable: boolean;
  tagName: string;
  entityName: string;
}

interface AIDragContextType {
  selectedElement: AIElementContext | null;
  clearSelection: () => void;
  isDragging: boolean;
  isDrawerOpen: boolean;
  setActions: (actions: React.ReactNode) => void;
  registerPlaceholder: (el: HTMLDivElement | null) => void;
  openAI: (context?: AIElementContext) => void;
}

// === Context ===
const AIDragContext = createContext<AIDragContextType>({
  selectedElement: null,
  clearSelection: () => { },
  isDragging: false,
  isDrawerOpen: false,
  setActions: () => { },
  registerPlaceholder: () => { },
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
        entityName: '',
      };
      // Try to extract current value
      if (current instanceof HTMLInputElement || current instanceof HTMLSelectElement || current instanceof HTMLTextAreaElement) {
        info.value = current.value;
      } else {
        const input = current.querySelector('input, select, textarea') as HTMLInputElement | null;
        if (input) info.value = input.value;
      }
      // For macro 'Record' targets, extract the human-readable entity name from text content
      if (field && field.endsWith('Record')) {
        // Look for the primary text — first heading or bold span child
        const nameEl = current.querySelector('h4, span.font-medium, span.font-semibold, .font-medium, .font-semibold');
        if (nameEl) {
          info.entityName = nameEl.textContent?.trim() || '';
        } else {
          // Fallback: take the first line of innerText
          info.entityName = current.innerText?.split('\n')[0]?.trim() || '';
        }
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

export function AIDragProvider({
  children,
  onOpenAI,
  showButton,
  isDrawerOpen,
}: AIDragProviderProps) {
  const [selectedElement, setSelectedElement] = useState<AIElementContext | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDetached, setIsDetached] = useState(false);
  const [isRippling, setIsRippling] = useState(false);
  const [currentActions, setCurrentActions] = useState<React.ReactNode>(null);


  const triggerRipple = useCallback(() => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
  }, []);

  // ... (previous refs and state remain same)
  const dockRef = useRef<HTMLButtonElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const liquidOverlayRef = useRef<HTMLDivElement>(null);
  const dockBlobRef = useRef<HTMLDivElement>(null);
  const orbBlobRef = useRef<HTMLDivElement>(null);
  const dockBgRef = useRef<HTMLDivElement>(null);
  // Two-circle drag orb refs
  const orbGooLayerRef = useRef<HTMLDivElement>(null);
  const orbAnchorCircleRef = useRef<HTMLDivElement>(null);
  const orbIconCircleRef = useRef<HTMLDivElement>(null);
  const orbIconRef = useRef<HTMLDivElement>(null);

  const dragState = useRef({
    active: false,
    dockCenter: { x: 0, y: 0 },
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

  const [placeholderElement, setPlaceholderElement] = useState<HTMLDivElement | null>(null);
  const [restingPos, setRestingPos] = useState({ left: '50%', transform: 'translateX(-50%) scale(1)' });

  // Reset any drag-induced deformation on the dock background whenever the drawer opens/closes
  useEffect(() => {
    if (dockBgRef.current) {
      dockBgRef.current.style.transition = '';
      dockBgRef.current.style.transform = '';
      dockBgRef.current.style.backgroundColor = '';
      dockBgRef.current.style.boxShadow = '';
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!placeholderElement) {
      setRestingPos({ left: '50%', transform: 'translateX(-50%) scale(1)' });
      return;
    }

    const measure = () => {
      const rect = placeholderElement.getBoundingClientRect();
      if (rect.width > 0 && rect.left > 0) {
        setRestingPos({
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%) scale(1)'
        });
      } else {
        setRestingPos({ left: '50%', transform: 'translateX(-50%) scale(1)' });
      }
    };

    // Measure immediately for general layout changes
    measure();
    // After drawer closes the actionsPosition has a 0.4s CSS transition.
    // Delay re-measure until after it settles so we get the correct placeholder coords.
    const timer = setTimeout(measure, 450);
    const raf = requestAnimationFrame(measure);

    const observer = new ResizeObserver(measure);
    observer.observe(document.body); // broad observe to catch menu expands
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [placeholderElement, currentActions, isDrawerOpen]);

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
        opacity: 1,
        pointerEvents: 'auto' as const,
        zIndex: 100,
      };
    }

    if (isDragging && isDetached) {
      // Keep home base visible as a drop zone for cancellation
      return {
        left: restingPos.left,
        bottom: windowWidth >= 1024 ? '12px' : '16px',
        top: 'auto',
        transform: restingPos.transform,
        opacity: 1,
        pointerEvents: 'none' as const,
        zIndex: 40, // Below the floating ghost
      };
    }

    // Default centered at bottom
    return {
      left: restingPos.left,
      bottom: windowWidth >= 1024 ? '12px' : '16px',
      top: 'auto',
      transform: restingPos.transform,
      opacity: 1,
      pointerEvents: 'auto' as const,
      zIndex: 50,
    };
  }, [isDrawerOpen, isDragging, isDetached, windowWidth, restingPos]);

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

    const button = dockRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    dragState.current = {
      active: true,
      dockCenter: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
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
      const dx = e.clientX - state.dockCenter.x;
      const dy = e.clientY - state.dockCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Detect meaningful drag vs click
      const totalMove = Math.sqrt(
        (e.clientX - state.startPos.x) ** 2 + (e.clientY - state.startPos.y) ** 2
      );
      if (totalMove > 5) state.moved = true;

      if (!state.hasDetached && dist > DETACH_DISTANCE) {
        state.hasDetached = true;
        // Fade out home base right as it finishes its bounce
        setTimeout(() => {
          if (dragState.current.active) setIsDetached(true);
        }, 250);

        // Button spring-back with overshoot
        if (dockRef.current) {
          dockRef.current.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          dockRef.current.style.transform = 'scale(0.85)';
          setTimeout(() => {
            if (dockRef.current) {
              dockRef.current.style.transform = 'scale(1)';
            }
          }, 120);
        }
      }

      // === Update ghost: anchor at cursor, icon top-left ===
      const opacity = state.hasDetached ? 1 : Math.min(1, dist / 5);
      const _scale = state.hasDetached ? 1 : Math.max(0.6, 0.6 + (dist / DETACH_DISTANCE) * 0.4);
      // Touch thumbs are much larger — push the icon bubble further away
      const isTouch = (e as PointerEvent).pointerType === 'touch';
      const iconX = e.clientX + (isTouch ? -10 : -14);
      const iconY = e.clientY + (isTouch ? -60 : -48);

      if (orbAnchorCircleRef.current) {
        orbAnchorCircleRef.current.style.left = `${e.clientX}px`;
        orbAnchorCircleRef.current.style.top = `${e.clientY}px`;
      }
      if (orbIconCircleRef.current) {
        orbIconCircleRef.current.style.left = `${iconX}px`;
        orbIconCircleRef.current.style.top = `${iconY}px`;
      }
      if (orbIconRef.current) {
        orbIconRef.current.style.left = `${iconX}px`;
        orbIconRef.current.style.top = `${iconY}px`;
        orbIconRef.current.style.opacity = String(opacity);
      }
      if (orbGooLayerRef.current) {
        orbGooLayerRef.current.style.opacity = String(opacity);
      }

      // === Update Liquid Blobs (Gooey effect) ===
      const isNearCancel = state.hasDetached && dist < 60;

      if (dockBlobRef.current && orbBlobRef.current && liquidOverlayRef.current) {
        if (!state.hasDetached || isNearCancel) {
          liquidOverlayRef.current.style.opacity = '1';

          const bRect = dockRef.current?.getBoundingClientRect();
          if (bRect) {
            const bx = bRect.left + bRect.width / 2;
            const by = bRect.top + bRect.height / 2;
            dockBlobRef.current.style.transform = `translate(${bx}px, ${by}px) translate(-50%, -50%) scale(1.1)`;
            dockBlobRef.current.style.width = `${bRect.width}px`;
            dockBlobRef.current.style.height = `${bRect.height}px`;
          }

          orbBlobRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(1.1)`;
          orbBlobRef.current.style.opacity = '1';
        } else {
          // Bounce back to circle immediately on detachment or when flying away
          if (liquidOverlayRef.current.style.opacity !== '0') {
            liquidOverlayRef.current.style.opacity = '0';
            if (dockBgRef.current) {
              dockBgRef.current.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
              dockBgRef.current.style.transform = 'scale(1)';
            }
          }
        }
      }

      // === Button deformation / Cancel hover ===
      if (dockBgRef.current) {
        if (!state.hasDetached || isNearCancel) {
          const pullFactor = Math.min(0.2, dist / 400);
          const angle = Math.atan2(dy, dx);
          const squish = 1 + Math.min(0.3, dist / 250);

          dockBgRef.current.style.transform = [
            `translate(${Math.cos(angle) * dist * pullFactor}px, ${Math.sin(angle) * dist * pullFactor}px)`,
            `rotate(${angle}rad)`,
            `scaleX(${squish})`,
            `scaleY(${1 / squish})`,
            `rotate(${-angle}rad)`,
          ].join(' ');

          if (state.hasDetached && dist < 40) {
            dockBgRef.current.style.backgroundColor = '#fef2f2'; // red-50
            dockBgRef.current.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)'; // faint red ring
          } else {
            dockBgRef.current.style.backgroundColor = '#ffffff';
            dockBgRef.current.style.boxShadow = '';
          }
        } else {
          // It's fully detached and far away
          dockBgRef.current.style.transform = 'scale(1)';
          dockBgRef.current.style.backgroundColor = '#ffffff';
          dockBgRef.current.style.boxShadow = '';
        }
      }

      // === Element detection ===
      // Temporarily hide overlay so elementFromPoint sees through it
      if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none';
      const elUnder = document.elementFromPoint(e.clientX, e.clientY);
      if (overlayRef.current) overlayRef.current.style.pointerEvents = '';

      // Ignore the button itself
      if (elUnder === dockRef.current || dockRef.current?.contains(elUnder as Node)) {
        clearHighlight();
        return;
      }

      const target = findAITarget(elUnder);
      // A "real" selectable target must have a fieldName (data-ai-field), not just a section
      const isSelectableField = !!(target?.info.fieldName);

      if (target && target.element !== state.highlightedEl) {
        clearHighlight();
        state.highlightedEl = target.element;
        state.elementInfo = target.info;
        target.element.style.transition = 'outline 0.15s, box-shadow 0.15s';
        target.element.style.outline = '2px solid #b25b8b';
        target.element.style.outlineOffset = '3px';
        target.element.style.boxShadow = '0 0 0 6px rgba(178, 91, 139, 0.12), 0 0 20px rgba(178, 91, 139, 0.18)';

        // Only animate icon when over a real field (not just a section background)
        if (isSelectableField) {
          if (orbIconCircleRef.current) {
            orbIconCircleRef.current.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
            orbIconCircleRef.current.style.transform = 'translate(-50%, -50%) scale(1.2)';
          }
          if (orbIconRef.current) {
            orbIconRef.current.style.animation = 'drag-orb-hover 1.8s linear infinite';
          }
        } else {
          // Section-only target — stop any prior animation
          if (orbIconCircleRef.current) {
            orbIconCircleRef.current.style.transition = 'transform 0.2s ease-out';
            orbIconCircleRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
          }
          if (orbIconRef.current) {
            orbIconRef.current.style.animation = 'none';
          }
        }

        // Show label near ghost
        if (labelRef.current) {
          labelRef.current.textContent = target.info.label;
          labelRef.current.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 80}px)`;
          labelRef.current.style.opacity = '1';
        }
      } else if (!target) {
        clearHighlight();
        // Stop icon animation
        if (orbIconCircleRef.current) {
          orbIconCircleRef.current.style.transition = 'transform 0.2s ease-out';
          orbIconCircleRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        if (orbIconRef.current) {
          orbIconRef.current.style.animation = 'none';
        }
      } else if (target && !isSelectableField && orbIconRef.current?.style.animation !== 'none') {
        // Still on a non-field target — ensure animation is off
        if (orbIconRef.current) orbIconRef.current.style.animation = 'none';
        if (orbIconCircleRef.current) {
          orbIconCircleRef.current.style.transition = 'transform 0.2s ease-out';
          orbIconCircleRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
        }
      } else if (target && labelRef.current) {
        // Same field element, just update label position
        labelRef.current.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 80}px)`;
      }
    };

    const handleUp = (_e: PointerEvent) => {
      const state = dragState.current;
      if (!state.active) return;
      state.active = false;

      // Reset button transform
      if (dockBgRef.current && state.moved) {
        dockBgRef.current.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        dockBgRef.current.style.transform = 'scale(1)';
        setTimeout(() => {
          if (dockBgRef.current) {
            dockBgRef.current.style.transition = '';
            dockBgRef.current.style.transform = '';
          }
        }, 500);
      }

      // Always reset drag-orb icon animation on pointer up
      if (orbIconRef.current) orbIconRef.current.style.animation = 'none';
      if (orbIconCircleRef.current) {
        orbIconCircleRef.current.style.transition = 'transform 0.2s ease-out';
        orbIconCircleRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      }

      // Hide label
      if (labelRef.current) {
        labelRef.current.style.opacity = '0';
      }

      // Decide outcome
      // ONLY trigger Case 1 (Open with context) if it's a FIELD.
      // Sections are treated as background and zip back unless it was a click.
      const isTargetField = state.highlightedEl && state.elementInfo?.fieldName;

      const dx = _e.clientX - state.dockCenter.x;
      const dy = _e.clientY - state.dockCenter.y;
      const finalDist = Math.sqrt(dx * dx + dy * dy);
      const isCancelDrop = state.hasDetached && finalDist < 40;

      // Reset hover cancel styles
      if (dockBgRef.current) {
        dockBgRef.current.style.backgroundColor = '';
        dockBgRef.current.style.boxShadow = '';
      }

      if (isTargetField && state.elementInfo && state.moved && !isCancelDrop) {
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
        setIsDetached(false); // Reset detached state
        onOpenAI(info); // SUCCESS: Drag to Field -> OPEN
      } else {
        clearHighlight();

        // Case 2: Moved far but hit Nothing -> ZIP BACK
        if (state.moved && dockRef.current) {
          setIsDetached(false);

          if (orbGooLayerRef.current) {
            orbGooLayerRef.current.style.transition = 'opacity 0.3s ease-in';
            orbGooLayerRef.current.style.opacity = '0';
          }
          if (orbIconRef.current) {
            orbIconRef.current.style.transition = 'opacity 0.3s ease-in';
            orbIconRef.current.style.opacity = '0';
          }

          const orbBlob = orbBlobRef.current;
          if (orbBlob && dockRef.current) {
            const dockRect2 = dockRef.current.getBoundingClientRect();
            const bx2 = dockRect2.left + dockRect2.width / 2;
            const by2 = dockRect2.top + dockRect2.height / 2;
            orbBlob.style.transition = 'transform 0.35s cubic-bezier(0.2, 0, 0, 1.2), opacity 0.1s ease-in 0.25s';
            orbBlob.style.transform = `translate(${bx2}px, ${by2}px) translate(-50%, -50%) scale(0)`;
            orbBlob.style.opacity = '0';
          }

          setTimeout(() => {
            if (dockRef.current) {
              dockRef.current.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
              dockRef.current.style.transform = 'scale(0.85)';
              setTimeout(() => {
                if (dockRef.current) {
                  dockRef.current.style.transform = 'scale(1)';
                  setTimeout(() => { if (dockRef.current) dockRef.current.style.transition = ''; }, 450);
                }
              }, 120);
            }
            if (liquidOverlayRef.current) liquidOverlayRef.current.style.opacity = '0';
            if (orbGooLayerRef.current) orbGooLayerRef.current.style.transition = '';
            if (orbIconRef.current) orbIconRef.current.style.transition = '';
            triggerRipple();
            setIsDragging(false);
            setIsDetached(false);
          }, 300);
        } else {
          // Case 3: Simple Click (didn't move much) -> OPEN normally
          setIsDragging(false);
          setIsDetached(false);
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
    <AIDragContext.Provider
      value={{
        selectedElement,
        clearSelection,
        isDragging,
        isDrawerOpen: isDrawerOpen || false,
        setActions: setCurrentActions,
        registerPlaceholder: setPlaceholderElement,
        openAI: onOpenAI,
      }}
    >
      {children}

      {/* Supplementary actions (Quick Actions, Views, etc) - Stays centered in Page area */}
      <div
        className="fixed bottom-4 lg:bottom-3 z-40 pointer-events-none flex items-center justify-center"
        style={{
          ...actionsPosition,
          transition: 'left 0.4s cubic-bezier(0.2, 0, 0, 1.2)',
        }}
      >
        <div className="pointer-events-auto flex items-center gap-3">
          {currentActions}
        </div>
      </div>

      <div
        className="fixed pointer-events-none"
        style={{
          ...positionStyles,
          transition: 'all 0.5s cubic-bezier(0.2, 0, 0, 1.2), opacity 0.3s ease-in-out',
        }}
      >
        <div className="pointer-events-auto">
          {showButton && (
            <button
              ref={dockRef}
              onPointerDown={handlePointerDown}
              className={`group relative w-14 h-14 flex items-center justify-center select-none touch-none cursor-grab active:cursor-grabbing ${isDrawerOpen ? 'z-[72]' : 'z-50'
                }`}
              aria-label="AI Assistant — click to chat, drag to inspect"
            >
              {/* Pulse Rings - Visual Affordance for Draggability (Hover or Triggered Ripple) */}
              {!isDragging && (
                <>
                  <div className="absolute inset-0 pointer-events-none group-hover:block hidden">
                    <div className="absolute inset-0 rounded-full border-2 border-ai-400 opacity-0 animate-[ai-orb-ripple_2.5s_infinite]" />
                    <div className="absolute inset-0 rounded-full border-2 border-ai-400 opacity-0 animate-[ai-orb-ripple_2.5s_infinite_1.2s]" />
                  </div>
                  {isRippling && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 border-2 border-ai-400 opacity-0 animate-[ai-wobble-ripple_1s_ease-out]" />
                      <div className="absolute inset-0 border-2 border-ai-300 opacity-0 animate-[ai-wobble-inner_0.8s_ease-out_0.1s]" />
                    </div>
                  )}
                </>
              )}

              {/* Deforming Background */}
              <div
                ref={dockBgRef}
                className="absolute inset-0 bg-white rounded-full shadow-lg border border-gray-200"
                style={{ willChange: 'transform' }}
              />

              {/* Persistent Circular Icon */}
              <div className="relative z-10 pointer-events-none transition-colors duration-200">
                {isDragging && isDetached ? (
                  <X className="w-5 h-5 text-red-500 font-bold" strokeWidth={3} />
                ) : (
                  <Sparkles className="w-5 h-5 text-ai-600" />
                )}
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

          @keyframes drag-orb-hover {
            0%   { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); }
            100% { transform: translate(-50%, -50%) scale(1.2) rotate(360deg); }
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
              ref={dockBlobRef}
              className="absolute bg-white rounded-full"
              style={{ willChange: 'transform' }}
            />
            <div
              ref={orbBlobRef}
              className="absolute w-10 h-10 bg-white rounded-full"
              style={{ willChange: 'transform' }}
            />
          </div>

          {/* Two-circle drag orb: gooey layer (white blobs, filtered) */}
          <div
            ref={orbGooLayerRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              filter: 'url(#drag-orb-goo) drop-shadow(0 6px 20px rgba(178, 91, 139, 0.55))',
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {/* Anchor: small circle AT cursor (hotspot) */}
            <div
              ref={orbAnchorCircleRef}
              style={{
                position: 'absolute',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'white',
                transform: 'translate(-50%, -50%)',
                willChange: 'left, top',
              }}
            />
            {/* Icon body: large circle top-right of cursor */}
            <div
              ref={orbIconCircleRef}
              style={{
                position: 'absolute',
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'white',
                transform: 'translate(-50%, -50%)',
                willChange: 'left, top',
              }}
            />
          </div>

          {/* Icon overlay — rendered outside the goo filter so sparkles render cleanly */}
          <div
            ref={orbIconRef}
            className="absolute flex items-center justify-center"
            style={{
              width: 52,
              height: 52,
              pointerEvents: 'none',
              opacity: 0,
              transform: 'translate(-50%, -50%)',
              willChange: 'left, top, opacity',
            }}
          >
            <Sparkles className="w-5 h-5 text-ai-600" />
          </div>

          {/* Target label tooltip */}
          <div
            ref={labelRef}
            className="absolute left-0 top-0 px-3 py-1.5 bg-ai-600 text-white text-xs font-semibold rounded-full shadow-lg whitespace-nowrap"
            style={{
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 0.15s',
              willChange: 'transform, opacity',
            }}
          />
        </div>
      )}

      {/* SVG Filters for Liquid Effects */}
      <svg className="fixed h-0 w-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Dock-to-orb gooey stretch (dock blob + initial detach) */}
          <filter id="ai-liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" result="goo" />
          </filter>
          {/* Two-circle drag orb gooey stretch (anchor + icon body) */}
          <filter id="drag-orb-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
          </filter>
        </defs>
      </svg>
    </AIDragContext.Provider>
  );
}
