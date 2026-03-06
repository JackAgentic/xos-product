import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PipelineStage {
  name: string;
  date: string;
}

export interface OpportunityPipelineProps {
  stages: PipelineStage[];
  probability: number;
  currentStage?: string;
}

export function OpportunityPipeline({ stages, probability, currentStage }: OpportunityPipelineProps) {
  const pipelineScrollRef = useRef<HTMLDivElement>(null);
  const pipelineCardRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [progressAnimated, setProgressAnimated] = useState(false);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (pipelineScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = pipelineScrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll pipeline with arrows
  const scrollPipeline = (direction: 'left' | 'right') => {
    if (pipelineScrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = pipelineScrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      pipelineScrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // Auto-scroll to current stage when opportunity changes
  useEffect(() => {
    setProgressAnimated(false);

    if (currentStage && pipelineScrollRef.current) {
      const currentStageIndex = stages.findIndex(stage => stage.name === currentStage);
      if (currentStageIndex !== -1) {
        const container = pipelineScrollRef.current;
        const containerWidth = container.offsetWidth;
        const contentWidth = 600; // min-w-[600px]
        const stageWidth = contentWidth / stages.length;
        const scrollPosition = (currentStageIndex * stageWidth) - (containerWidth / 2) + (stageWidth / 2);

        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }

      setTimeout(checkScrollPosition, 50);
      setTimeout(checkScrollPosition, 200);
      setTimeout(checkScrollPosition, 500);
      setTimeout(checkScrollPosition, 800);
    } else {
      setTimeout(checkScrollPosition, 50);
      setTimeout(checkScrollPosition, 200);
      setTimeout(checkScrollPosition, 500);
    }
  }, [currentStage, stages]);

  // Check scroll position on mount and window resize
  useEffect(() => {
    const timeouts = [
      setTimeout(checkScrollPosition, 100),
      setTimeout(checkScrollPosition, 300),
      setTimeout(checkScrollPosition, 600)
    ];

    const handleResize = () => {
      checkScrollPosition();
      setTimeout(checkScrollPosition, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Intersection Observer to trigger animation when component is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !progressAnimated) {
            setTimeout(() => {
              setProgressAnimated(true);
            }, 200);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px'
      }
    );

    if (pipelineCardRef.current) {
      observer.observe(pipelineCardRef.current);
    }

    return () => {
      if (pipelineCardRef.current) {
        observer.unobserve(pipelineCardRef.current);
      }
    };
  }, [progressAnimated, currentStage]);

  // Check scroll position on mount and resize
  useEffect(() => {
    checkScrollPosition();
    const timer1 = setTimeout(checkScrollPosition, 50);
    const timer2 = setTimeout(checkScrollPosition, 200);
    const timer3 = setTimeout(checkScrollPosition, 500);

    const handleResize = () => {
      checkScrollPosition();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStage]);

  // Check scroll position on mount and resize
  useEffect(() => {
    const initialCheck = setTimeout(() => {
      checkScrollPosition();
    }, 100);

    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => {
      clearTimeout(initialCheck);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  return (
    <div ref={pipelineCardRef} className="bg-white rounded-sm border border-gray-200 p-4 sm:pt-6 sm:pb-2 mb-6">
      <h3 className="font-semibold mb-4 sm:mb-6">Pipeline Progress</h3>

      {/* Scrollable container */}
      <div
        ref={pipelineScrollRef}
        className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide sm:pointer-events-auto pointer-events-none"
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="mb-4 min-w-[600px] sm:min-w-0">
          {/* Stage Labels */}
          <div className="flex justify-between items-center mb-2">
            {stages.map((stage, idx) => (
              <div key={idx} className="flex flex-col items-center" style={{ width: `${100 / stages.length}%` }}>
                <span className="text-xs font-medium text-gray-600 mb-1 text-center sm:whitespace-nowrap">{stage.name}</span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: progressAnimated ? `${(probability / 100) * 90}%` : 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-900 to-emerald-950"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-emerald-950 mr-1"></div>
            </motion.div>
          </div>

          {/* Stage Dates */}
          <div className="flex justify-between items-center mt-2">
            {stages.map((stage, idx) => (
              <div key={idx} className="flex flex-col items-center" style={{ width: `${100 / stages.length}%` }}>
                <span className="text-xs text-gray-500 text-center sm:whitespace-nowrap">{stage.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows Below */}
      <div className="flex items-center justify-between sm:hidden">
        {showLeftArrow ? (
          <button
            onClick={() => scrollPipeline('left')}
            className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        {showRightArrow ? (
          <button
            onClick={() => scrollPipeline('right')}
            className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </div>
  );
}
