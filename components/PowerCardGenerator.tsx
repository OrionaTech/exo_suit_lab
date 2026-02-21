'use client';

import { motion } from 'framer-motion';
import { StatProfile } from '@/utils/generateSuitStats';
import { exportPowerCard } from '@/utils/exportCard';
import { useState } from 'react';

type Props = {
  suitName: string;
  tier: string;
  stats: StatProfile;
  versionId: string;
  sourceCanvas: HTMLCanvasElement | null;
};

export function PowerCardGenerator({ suitName, tier, stats, versionId, sourceCanvas }: Props) {
  const [busy, setBusy] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={busy}
      onClick={async () => {
        try {
          setBusy(true);
          await exportPowerCard({ suitName, versionId, tier, stats, imageSource: sourceCanvas });
        } finally {
          setBusy(false);
        }
      }}
      className="holo-panel w-full px-4 py-3 text-sm uppercase tracking-widest text-cyan-100"
    >
      {busy ? 'Rendering Card…' : 'Generate Power Card'}
    </motion.button>
  );
}
