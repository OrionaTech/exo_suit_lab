import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createArmorGroup, disposeObject3D } from './armorFactory';
import { StatProfile, SuitSelection } from './generateSuitStats';

type ExportPayload = {
  suitName: string;
  versionId: string;
  tier: string;
  stats: StatProfile;
  imageSource: HTMLCanvasElement | null;
  selection: SuitSelection;
  armorColor: string;
};

export async function exportPowerCard({ suitName, versionId, tier, stats, imageSource, selection, armorColor }: ExportPayload) {
  const armorImage = await renderArmorPreview(selection, armorColor).catch(() => imageSource?.toDataURL('image/png') ?? '');

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#060814');
  gradient.addColorStop(1, '#07172b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 12; i++) {
    ctx.strokeStyle = `rgba(68,246,255,${0.04 + i * 0.005})`;
    ctx.strokeRect(40 + i * 3, 40 + i * 3, canvas.width - 80 - i * 6, canvas.height - 80 - i * 6);
  }

  ctx.font = '700 56px Orbitron, sans-serif';
  ctx.fillStyle = '#5ff9ff';
  ctx.fillText(suitName, 80, 120);
  ctx.font = '400 30px Orbitron, sans-serif';
  ctx.fillStyle = '#a4f8ff';
  ctx.fillText(`Version ${versionId}`, 80, 170);

  const imageTop = 220;
  const imageHeight = 700;
  ctx.fillStyle = 'rgba(14, 49, 78, 0.5)';
  ctx.fillRect(80, imageTop, 920, imageHeight);

  if (armorImage) {
    const image = await loadImage(armorImage);
    ctx.drawImage(image, 95, imageTop + 15, 890, imageHeight - 30);
  }

  ctx.strokeStyle = 'rgba(95, 249, 255, 0.85)';
  ctx.lineWidth = 3;
  ctx.strokeRect(80, imageTop, 920, imageHeight);

  const labels: [keyof StatProfile, string][] = [
    ['power', 'Power'],
    ['speed', 'Speed'],
    ['defense', 'Defense'],
    ['intelligence', 'Intelligence'],
    ['energy', 'Energy Output']
  ];

  labels.forEach(([key, label], index) => {
    const y = 980 + index * 60;
    const value = stats[key];
    const ratio = Math.min(value / 140, 1);

    ctx.font = '400 26px Orbitron, sans-serif';
    ctx.fillStyle = '#d5fdff';
    ctx.fillText(label, 80, y);

    ctx.fillStyle = 'rgba(60, 136, 168, 0.4)';
    ctx.fillRect(330, y - 20, 600, 22);

    const barGradient = ctx.createLinearGradient(330, y - 20, 930, y - 20);
    barGradient.addColorStop(0, '#57f8ff');
    barGradient.addColorStop(1, '#1e91ff');
    ctx.fillStyle = barGradient;
    ctx.fillRect(330, y - 20, 600 * ratio, 22);

    ctx.fillStyle = '#aefbff';
    ctx.fillText(String(value), 950, y);
  });

  ctx.font = '700 52px Orbitron, sans-serif';
  ctx.fillStyle = '#68fbff';
  ctx.fillText(`${tier} Tier`, 80, 1290);
  ctx.font = '400 24px Orbitron, sans-serif';
  ctx.fillStyle = '#8be8ff';
  ctx.fillText('ExoSuit Lab Collection', 730, 1290);

  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.save();
  ctx.translate(-320, 0);
  ctx.rotate(-0.4);
  ctx.fillRect(0, 380, 420, 1380);
  ctx.restore();

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${suitName.replace(/\s+/g, '_')}_${versionId}.png`;
  link.click();
}

async function renderArmorPreview(selection: SuitSelection, armorColor: string) {
  const width = 900;
  const height = 900;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1.5);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(1.8, 2.3, 4.7);
  camera.lookAt(0, 1.1, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

  scene.add(new THREE.HemisphereLight('#89ceff', '#0f1728', 0.55));
  const key = new THREE.DirectionalLight('#ffffff', 3.4);
  key.position.set(4, 6, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#4ce8ff', 1.2);
  rim.position.set(-4, 3, -4);
  scene.add(rim);

  const armor = createArmorGroup(selection, { color: armorColor, emissive: '#0f7f9a' });
  scene.add(armor);

  renderer.render(scene, camera);
  const data = renderer.domElement.toDataURL('image/png');

  disposeObject3D(armor);
  pmrem.dispose();
  renderer.dispose();
  return data;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image load failed'));
    image.src = src;
  });
}
