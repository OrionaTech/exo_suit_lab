'use client';

import { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createArmorGroup, disposeObject3D } from '@/utils/armorFactory';
import { SuitSelection } from '@/utils/generateSuitStats';

type CameraView = 'front' | 'side' | 'back' | 'top';

type HologramSuitProps = {
  selection: SuitSelection;
  rotationVelocity: number;
  zoomVelocity: number;
  armorColor: string;
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
  activeView: CameraView;
  resetCameraSignal: number;
};

const views: Record<CameraView, THREE.Vector3> = {
  front: new THREE.Vector3(1.8, 2.2, 4.6),
  side: new THREE.Vector3(4.8, 2.1, 0),
  back: new THREE.Vector3(-1.6, 2.1, -4.8),
  top: new THREE.Vector3(0.01, 6.0, 0.01)
};

function HologramSuitImpl({ selection, rotationVelocity, zoomVelocity, armorColor, onCanvasReady, activeView, resetCameraSignal }: HologramSuitProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const armorRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const velRef = useRef({ rotation: 0, zoom: 0 });

  useEffect(() => {
    velRef.current = { rotation: rotationVelocity, zoom: zoomVelocity };
  }, [rotationVelocity, zoomVelocity]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#040712');

    const camera = new THREE.PerspectiveCamera(42, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.copy(views.front);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.physicallyCorrectLights = true;
    mountRef.current.appendChild(renderer.domElement);
    onCanvasReady(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;
    scene.environment = env;

    const hemi = new THREE.HemisphereLight('#7dc8ff', '#0f1728', 0.5);
    scene.add(hemi);

    const key = new THREE.DirectionalLight('#d5f6ff', 3.6);
    key.position.set(4, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);

    const rim = new THREE.DirectionalLight('#4ce8ff', 1.6);
    rim.position.set(-3, 3, -5);
    scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 48),
      new THREE.MeshStandardMaterial({ color: '#0b1522', metalness: 0.2, roughness: 0.8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.78;
    ground.receiveShadow = true;
    scene.add(ground);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 2.6;
    controls.maxDistance = 7.2;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(mountRef.current.clientWidth, mountRef.current.clientHeight), 0.35, 0.6, 0.25));

    // keep GLTFLoader in pipeline for future modular GLTF upgrades without blocking runtime
    const gltfLoader = new GLTFLoader();
    void gltfLoader;

    let frame = 0;
    const animate = () => {
      if (armorRef.current) {
        armorRef.current.rotation.y += 0.0035 + velRef.current.rotation * 0.012;
      }

      if (Math.abs(velRef.current.zoom) > 0.0002) {
        const nextDist = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) - velRef.current.zoom * 0.35, controls.minDistance, controls.maxDistance);
        const dir = camera.position.clone().sub(controls.target).normalize();
        camera.position.copy(controls.target.clone().addScaledVector(dir, nextDist));
      }

      controls.update();
      composer.render();
      frame = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      composer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      composer.dispose();
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
      pmrem.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      onCanvasReady(null);
    };
  }, [onCanvasReady]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (armorRef.current) {
      scene.remove(armorRef.current);
      disposeObject3D(armorRef.current);
    }
    const armor = createArmorGroup(selection, { color: armorColor, emissive: '#0f7f9a' });
    armorRef.current = armor;
    scene.add(armor);
  }, [selection, armorColor]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const start = camera.position.clone();
    const end = views[activeView].clone();
    let t = 0;
    const id = window.setInterval(() => {
      t += 0.08;
      camera.position.lerpVectors(start, end, Math.min(t, 1));
      if (t >= 1) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [activeView]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || resetCameraSignal === 0) return;
    camera.position.copy(views.front);
    controls.target.set(0, 1.2, 0);
    controls.update();
  }, [resetCameraSignal]);

  return <div ref={mountRef} className="h-full w-full" />;
}

export const HologramSuit = memo(HologramSuitImpl);
