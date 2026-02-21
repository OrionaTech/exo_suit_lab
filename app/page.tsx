'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HologramSuit } from '@/components/HologramSuit';
import { HandController } from '@/components/HandController';
import { ControlPanel } from '@/components/ControlPanel';
import { PowerCardGenerator } from '@/components/PowerCardGenerator';
import { useHandTracking } from '@/hooks/useHandTracking';
import { computeSuitStats, SuitSection, SuitSelection } from '@/utils/generateSuitStats';
import { generateSuitName, generateVersionId } from '@/utils/generateSuitName';

const sections: SuitSection[] = ['helmet', 'chest', 'arms', 'legs'];

export default function Page() {
  const [selection, setSelection] = useState<SuitSelection>({ helmet: 0, chest: 0, arms: 0, legs: 0 });
  const [activeSection, setActiveSection] = useState<SuitSection>('helmet');
  const [suitName] = useState(() => generateSuitName());
  const [versionId] = useState(() => generateVersionId());
  const [showIntro, setShowIntro] = useState(true);
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(null);
  const { videoRef, handState, loading } = useHandTracking();
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);

  const { total, tier } = useMemo(() => computeSuitStats(selection), [selection]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (handState.swipe) {
      const current = sections.indexOf(activeSection);
      const next = (current + (handState.swipe === 'right' ? 1 : -1) + sections.length) % sections.length;
      setActiveSection(sections[next]);
    }
  }, [activeSection, handState.swipe]);

  useEffect(() => {
    if (handState.pinch) {
      setSelection((prev) => ({
        ...prev,
        [activeSection]: (prev[activeSection] + 1) % 3
      }));
    }
  }, [activeSection, handState.pinch]);

  const cycleVariation = (section: SuitSection, delta: number) => {
    setSelection((prev) => ({
      ...prev,
      [section]: (prev[section] + delta + 3) % 3
    }));
  };

  const onCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    setSourceCanvas(canvas);
  }, []);

  useEffect(() => {
    if (!handState.scrollDelta) return;
    leftPanelRef.current && (leftPanelRef.current.scrollTop -= handState.scrollDelta);
    rightPanelRef.current && (rightPanelRef.current.scrollTop -= handState.scrollDelta);
  }, [handState.scrollDelta]);

  return (
    <main className="scanline relative h-screen w-screen overflow-hidden bg-labBg">
      <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-40" />
      <div className="absolute -top-32 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl" />

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#04040d]"
          >
            <motion.p
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="text-xl uppercase tracking-[0.3em] text-cyan-200"
            >
              Initializing Hologram Interface…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 grid h-full grid-cols-12 gap-5 p-6"
      >
        <aside ref={leftPanelRef} className="col-span-3 overflow-y-auto">
          <ControlPanel
            activeSection={activeSection}
            selection={selection}
            onSelectSection={setActiveSection}
            onCycleVariation={cycleVariation}
            stats={total}
            tier={tier}
            suitName={suitName}
          />
        </aside>

        <section className="holo-panel col-span-6 relative overflow-hidden">
          <HologramSuit
            selection={selection}
            rotationVelocity={handState.rotationDelta}
            zoomVelocity={handState.zoomDelta}
            onCanvasReady={onCanvasReady}
          />
          <div className="pointer-events-none absolute left-4 top-4 text-xs uppercase tracking-wider text-cyan-200/80">
            {loading ? 'Calibrating gesture core…' : `Hands detected: ${handState.handCount}`}
          </div>
        </section>

        <aside ref={rightPanelRef} className="col-span-3 space-y-4 overflow-y-auto">
          <div className="holo-panel p-4 text-xs uppercase tracking-wider text-cyan-200/80">
            <p>Gesture Mapping</p>
            <ul className="mt-3 space-y-2 text-[11px] text-cyan-100/85">
              <li>• Index finger = cursor</li>
              <li>• Pinch = cycle selected part</li>
              <li>• Vertical motion = rotate suit</li>
              <li>• Horizontal swipe = switch module</li>
              <li>• Dual-hand spread = zoom</li>
              <li>• Dual-hand vertical = panel scroll</li>
            </ul>
          </div>
          <PowerCardGenerator suitName={suitName} tier={tier} stats={total} versionId={versionId} sourceCanvas={sourceCanvas} />
        </aside>
      </motion.div>

      <HandController videoRef={videoRef} handState={handState} />
    </main>
  );
}
