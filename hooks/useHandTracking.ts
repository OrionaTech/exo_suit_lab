'use client';

import { useEffect, useRef, useState } from 'react';

export type HandState = {
  cursor: { x: number; y: number };
  pinch: boolean;
  swipe: 'left' | 'right' | null;
  rotationDelta: number;
  zoomDelta: number;
  scrollDelta: number;
  handCount: number;
};

const initial: HandState = {
  cursor: { x: 0.5, y: 0.5 },
  pinch: false,
  swipe: null,
  rotationDelta: 0,
  zoomDelta: 0,
  scrollDelta: 0,
  handCount: 0
};

type Landmark = { x: number; y: number; z: number };

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<HandState>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const smoothCursor = { x: 0.5, y: 0.5 };
    let prevX = 0.5;
    let prevY = 0.5;
    let prevDistance = 0;
    let prevAvgY = 0;

    const processLandmarks = (landmarks: Landmark[][]) => {
      if (!landmarks?.length) {
        setState((prev) => ({ ...prev, swipe: null, pinch: false, handCount: 0 }));
        return;
      }

      const primary = landmarks[0];
      const index = primary[8];
      const thumb = primary[4];

      smoothCursor.x += (index.x - smoothCursor.x) * 0.25;
      smoothCursor.y += (index.y - smoothCursor.y) * 0.25;

      const pinchDistance = Math.hypot(index.x - thumb.x, index.y - thumb.y);
      const pinch = pinchDistance < 0.045;
      const velocityX = smoothCursor.x - prevX;
      const swipe = velocityX > 0.02 ? 'right' : velocityX < -0.02 ? 'left' : null;
      const rotationDelta = (prevY - smoothCursor.y) * 6;

      let zoomDelta = 0;
      let scrollDelta = 0;
      if (landmarks.length > 1) {
        const secondary = landmarks[1];
        const centerA = primary[9];
        const centerB = secondary[9];
        const distance = Math.hypot(centerA.x - centerB.x, centerA.y - centerB.y);
        zoomDelta = prevDistance ? (distance - prevDistance) * 4.5 : 0;
        prevDistance = distance;

        const avgY = (centerA.y + centerB.y) / 2;
        scrollDelta = prevAvgY ? (prevAvgY - avgY) * 18 : 0;
        prevAvgY = avgY;
      } else {
        prevDistance = 0;
        prevAvgY = 0;
      }

      prevX = smoothCursor.x;
      prevY = smoothCursor.y;

      setState({
        cursor: smoothCursor,
        pinch,
        swipe,
        rotationDelta,
        zoomDelta,
        scrollDelta,
        handCount: landmarks.length
      });
    };

    const init = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 960, height: 540 } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;

        const hands = new window.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6
        });

        hands.onResults((results: { multiHandLandmarks?: Landmark[][] }) => {
          processLandmarks(results.multiHandLandmarks ?? []);
        });

        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) await hands.send({ image: videoRef.current });
          },
          width: 960,
          height: 540
        });

        await camera.start();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      const media = videoRef.current?.srcObject as MediaStream | null;
      media?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { videoRef, handState: state, loading };
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src=\"${src}\"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}
