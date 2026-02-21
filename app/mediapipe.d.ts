export {};

declare global {
  interface Window {
    Hands: new (config: { locateFile: (file: string) => string }) => {
      setOptions: (options: {
        maxNumHands: number;
        modelComplexity: number;
        minDetectionConfidence: number;
        minTrackingConfidence: number;
      }) => void;
      onResults: (cb: (results: { multiHandLandmarks?: { x: number; y: number; z: number }[][] }) => void) => void;
      send: (input: { image: HTMLVideoElement }) => Promise<void>;
    };
    Camera: new (
      video: HTMLVideoElement,
      config: { onFrame: () => Promise<void>; width: number; height: number }
    ) => {
      start: () => Promise<void>;
      stop?: () => void;
    };
  }
}
