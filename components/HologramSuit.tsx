'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SuitSection } from '@/utils/generateSuitStats';

type HologramSuitProps = {
  selection: Record<SuitSection, number>;
  rotationVelocity: number;
  zoomVelocity: number;
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
};

const createMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: new THREE.Color('#44f6ff'),
    emissive: new THREE.Color('#1f85b1'),
    emissiveIntensity: 1,
    wireframe: true,
    transparent: true,
    opacity: 0.88
  });

function variationGeometry(section: SuitSection, variant: number) {
  switch (section) {
    case 'helmet':
      return [new THREE.OctahedronGeometry(0.65 + variant * 0.05), new THREE.SphereGeometry(0.62, 16, 12), new THREE.ConeGeometry(0.62, 1.1, 10)][variant];
    case 'chest':
      return [new THREE.BoxGeometry(1.2, 1.3, 0.7), new THREE.CylinderGeometry(0.65, 0.85, 1.3, 10), new THREE.DodecahedronGeometry(0.8)][variant];
    case 'arms':
      return [new THREE.CylinderGeometry(0.18, 0.22, 1.3, 8), new THREE.BoxGeometry(0.34, 1.25, 0.38), new THREE.CapsuleGeometry(0.2, 0.85, 4, 8)][variant];
    case 'legs':
      return [new THREE.CylinderGeometry(0.24, 0.3, 1.6, 8), new THREE.BoxGeometry(0.42, 1.5, 0.42), new THREE.CapsuleGeometry(0.24, 1.15, 4, 8)][variant];
  }
}

export function HologramSuit({ selection, rotationVelocity, zoomVelocity, onCanvasReady }: HologramSuitProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const suitRef = useRef<THREE.Group | null>(null);
  const velRef = useRef({ rotation: 0, zoom: 0 });

  useEffect(() => {
    velRef.current = { rotation: rotationVelocity, zoom: zoomVelocity };
  }, [rotationVelocity, zoomVelocity]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.set(0, 1.6, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    onCanvasReady(renderer.domElement);

    scene.add(new THREE.AmbientLight('#48ebff', 0.35));
    const key = new THREE.PointLight('#5af4ff', 1.2, 40);
    key.position.set(4, 6, 6);
    scene.add(key);

    const suit = new THREE.Group();
    suitRef.current = suit;
    scene.add(suit);

    const particles = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.Float32BufferAttribute(Array.from({ length: 350 * 3 }, () => (Math.random() - 0.5) * 10), 3)
      ),
      new THREE.PointsMaterial({ color: '#6cffff', size: 0.015, transparent: true, opacity: 0.6 })
    );
    scene.add(particles);

    let frame = 0;
    let scale = 1;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      particles.rotation.y = t * 0.08;
      particles.material.opacity = 0.35 + Math.sin(t * 2.2) * 0.2;

      if (suitRef.current) {
        suitRef.current.rotation.y += 0.006 + velRef.current.rotation * 0.03;
        scale = THREE.MathUtils.clamp(scale + velRef.current.zoom * 0.04, 0.8, 1.7);
        suitRef.current.scale.setScalar(scale);
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      onCanvasReady(null);
    };
  }, [onCanvasReady]);

  useEffect(() => {
    if (!suitRef.current) return;
    suitRef.current.clear();

    const material = createMaterial();
    const helmet = new THREE.Mesh(variationGeometry('helmet', selection.helmet), material);
    helmet.position.y = 2.35;

    const chest = new THREE.Mesh(variationGeometry('chest', selection.chest), material);
    chest.position.y = 1.15;

    const armLeft = new THREE.Mesh(variationGeometry('arms', selection.arms), material);
    armLeft.position.set(-0.95, 1.15, 0);
    const armRight = armLeft.clone();
    armRight.position.x = 0.95;

    const legLeft = new THREE.Mesh(variationGeometry('legs', selection.legs), material);
    legLeft.position.set(-0.45, -0.35, 0);
    const legRight = legLeft.clone();
    legRight.position.x = 0.45;

    suitRef.current.add(helmet, chest, armLeft, armRight, legLeft, legRight);
  }, [selection]);

  return <div ref={mountRef} className="h-full w-full" />;
}
