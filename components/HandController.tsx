'use client';

import { motion } from 'framer-motion';
import { HandState } from '@/hooks/useHandTracking';

type HandControllerProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  handState: HandState;
};

export function HandController({ videoRef, handState }: HandControllerProps) {
  return (
    <>
      <video ref={videoRef} className="absolute right-6 bottom-6 h-36 w-56 rounded-xl border border-cyan-300/40 object-cover opacity-40" muted playsInline />
      <motion.div
        className="pointer-events-none absolute z-30 h-6 w-6 rounded-full border border-cyan-300 bg-cyan-300/20 shadow-[0_0_22px_rgba(68,246,255,.8)]"
        animate={{
          x: `${handState.cursor.x * 100}vw`,
          y: `${handState.cursor.y * 100}vh`,
          scale: handState.pinch ? 1.5 : 1
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 0.5 }}
      />
    </>
  );
}
