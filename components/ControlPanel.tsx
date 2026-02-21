'use client';

import { motion } from 'framer-motion';
import { StatProfile, SuitSection } from '@/utils/generateSuitStats';

const sectionOrder: SuitSection[] = ['helmet', 'chest', 'shoulders', 'gauntlets', 'legs', 'knees', 'back'];

export type CameraView = 'front' | 'side' | 'back' | 'top';

type ControlPanelProps = {
  activeSection: SuitSection;
  selection: Record<SuitSection, number>;
  onSelectSection: (section: SuitSection) => void;
  onCycleVariation: (section: SuitSection, delta: number) => void;
  stats: StatProfile;
  tier: string;
  suitName: string;
  armorColor: string;
  onColorChange: (color: string) => void;
  view: CameraView;
  onChangeView: (view: CameraView) => void;
};

export function ControlPanel(props: ControlPanelProps) {
  const { activeSection, selection, onSelectSection, onCycleVariation, stats, tier, suitName, armorColor, onColorChange, view, onChangeView } = props;

  return (
    <div className="space-y-4">
      <div className="holo-panel p-4">
        <p className="text-xs uppercase text-cyan-200/70">Active Build</p>
        <h1 className="text-2xl text-cyan-100">{suitName || 'Calibrating Identity...'}</h1>
        <p className="text-sm text-cyan-300/70">Tier {tier}</p>
      </div>

      <div className="holo-panel p-4">
        <p className="mb-2 text-xs uppercase text-cyan-200/70">Camera Views</p>
        <div className="grid grid-cols-2 gap-2 text-xs uppercase">
          {(['front', 'side', 'back', 'top'] as CameraView[]).map((item) => (
            <button
              key={item}
              className={`rounded border px-2 py-1 ${view === item ? 'border-cyan-300 bg-cyan-300/20' : 'border-cyan-300/30 bg-black/20'}`}
              onClick={() => onChangeView(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="holo-panel p-4">
        <p className="mb-2 text-xs uppercase text-cyan-200/70">Armor Tint</p>
        <input type="color" value={armorColor} onChange={(e) => onColorChange(e.target.value)} className="h-9 w-full rounded bg-transparent" />
      </div>

      <div className="holo-panel p-4">
        <p className="mb-3 text-xs uppercase text-cyan-200/70">Suit Modules</p>
        <div className="space-y-2">
          {sectionOrder.map((section) => (
            <motion.div
              key={section}
              whileHover={{ scale: 1.01 }}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm uppercase tracking-wider ${
                activeSection === section ? 'border-cyan-300/80 bg-cyan-300/15 text-cyan-100' : 'border-cyan-300/20 bg-black/20 text-cyan-200/80'
              }`}
            >
              <button onClick={() => onSelectSection(section)}>{section}</button>
              <div className="flex items-center gap-2">
                <button onClick={() => onCycleVariation(section, -1)}>◀</button>
                <span>V{selection[section] + 1}</span>
                <button onClick={() => onCycleVariation(section, 1)}>▶</button>
              </div>
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
              <motion.div className="h-full rounded bg-gradient-to-r from-cyan-300 to-blue-400" animate={{ width: `${Math.min(value, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
