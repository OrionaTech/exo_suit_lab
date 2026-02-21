'use client';

import { useEffect, useRef, useState } from 'react';

export type HandState = {
  cursor: { x: number; y: number };
  pinch: boolean;
  doublePinch: boolean;
  swipe: 'left' | 'right' | null;
  rotationDelta: number;
  zoomDelta: number;
  scrollDelta: number;
  handCount: number;
};

const initial: HandState = {
  cursor: { x: 0.5, y: 0.5 },
  pinch: false,
  doublePinch: false,
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
    let lastPinchTime = 0;

    const processLandmarks = (landmarks: Landmark[][]) => {
      if (!landmarks?.length) {
        setState((prev) => ({ ...prev, swipe: null, pinch: false, doublePinch: false, handCount: 0 }));
        return;
      }

      const adaptiveSmooth = landmarks.length > 1 ? 0.22 : 0.28;
      const primary = landmarks[0];
      const index = primary[8];
      const thumb = primary[4];

      smoothCursor.x += (index.x - smoothCursor.x) * adaptiveSmooth;
      smoothCursor.y += (index.y - smoothCursor.y) * adaptiveSmooth;

      const dx = smoothCursor.x - prevX;
      const dy = smoothCursor.y - prevY;
      const deadZone = 0.0025;
      const stableDx = Math.abs(dx) < deadZone ? 0 : dx;
      const stableDy = Math.abs(dy) < deadZone ? 0 : dy;

      const pinchDistance = Math.hypot(index.x - thumb.x, index.y - thumb.y);
      const pinch = pinchDistance < 0.045;
      const now = performance.now();
      const doublePinch = pinch && now - lastPinchTime < 280;
      if (pinch) lastPinchTime = now;

      const swipeThreshold = 0.022 + Math.min(Math.abs(stableDy), 0.018);
      const swipe = stableDx > swipeThreshold ? 'right' : stableDx < -swipeThreshold ? 'left' : null;
      const rotationDelta = -stableDy * 5.2;

      let zoomDelta = 0;
      let scrollDelta = 0;
      if (landmarks.length > 1) {
        const secondary = landmarks[1];
        const centerA = primary[9];
        const centerB = secondary[9];
        const distance = Math.hypot(centerA.x - centerB.x, centerA.y - centerB.y);
        zoomDelta = prevDistance ? (distance - prevDistance) * 3.7 : 0;
        prevDistance = distance;

        const avgY = (centerA.y + centerB.y) / 2;
        scrollDelta = prevAvgY ? (prevAvgY - avgY) * 14 : 0;
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
        doublePinch,
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
          minDetectionConfidence: 0.72,
          minTrackingConfidence: 0.68
        });
        hands.onResults((results: { multiHandLandmarks?: Landmark[][] }) => processLandmarks(results.multiHandLandmarks ?? []));

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
    if (existing) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}
