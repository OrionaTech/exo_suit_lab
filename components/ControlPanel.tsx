'use client';

import { motion } from 'framer-motion';
import { StatProfile, SuitSection } from '@/utils/generateSuitStats';

const sectionOrder: SuitSection[] = ['helmet', 'chest', 'arms', 'legs'];

type ControlPanelProps = {
  activeSection: SuitSection;
  selection: Record<SuitSection, number>;
  onSelectSection: (section: SuitSection) => void;
  onCycleVariation: (section: SuitSection, delta: number) => void;
  stats: StatProfile;
  tier: string;
  suitName: string;
};

export function ControlPanel({
  activeSection,
  selection,
  onSelectSection,
  onCycleVariation,
  stats,
  tier,
  suitName
}: ControlPanelProps) {
  return (
    <div className="space-y-4">
      <div className="holo-panel p-4">
        <p className="text-xs uppercase text-cyan-200/70">Active Build</p>
        <h1 className="text-2xl text-cyan-100">{suitName}</h1>
        <p className="text-sm text-cyan-300/70">Tier {tier}</p>
      </div>

      <div className="holo-panel p-4">
        <p className="mb-3 text-xs uppercase text-cyan-200/70">Suit Modules</p>
        <div className="space-y-2">
          {sectionOrder.map((section) => (
            <motion.div
              key={section}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm uppercase tracking-wider transition ${
                activeSection === section
                  ? 'border-cyan-300/80 bg-cyan-300/15 text-cyan-100'
                  : 'border-cyan-300/20 bg-black/20 text-cyan-200/80'
              }`}
            >
              <button onClick={() => onSelectSection(section)}>{section}</button>
              <span className="flex items-center gap-2">
                <button onClick={() => onCycleVariation(section, -1)}>◀</button>
                <span>V{selection[section] + 1}</span>
                <button onClick={() => onCycleVariation(section, 1)}>▶</button>
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="holo-panel p-4">
        <p className="mb-2 text-xs uppercase text-cyan-200/70">Telemetry</p>
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="mb-2">
            <div className="flex justify-between text-xs text-cyan-200/90">
              <span>{label}</span>
              <span>{value}</span>
            </div>
            <div className="h-1.5 rounded bg-cyan-300/15">
              <motion.div
                className="h-full rounded bg-gradient-to-r from-cyan-300 to-blue-400"
                animate={{ width: `${Math.min((value as number), 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
