import * as THREE from 'three';
import { SuitSection, SuitSelection } from './generateSuitStats';

export type ArmorBuildOptions = {
  color: string;
  emissive: string;
};

const sectionPositions: Record<SuitSection, THREE.Vector3> = {
  helmet: new THREE.Vector3(0, 2.35, 0),
  chest: new THREE.Vector3(0, 1.35, 0),
  shoulders: new THREE.Vector3(0, 1.65, 0),
  gauntlets: new THREE.Vector3(0, 0.95, 0),
  legs: new THREE.Vector3(0, -0.15, 0),
  knees: new THREE.Vector3(0, -0.85, 0.02),
  back: new THREE.Vector3(0, 1.35, -0.32)
};

function createMaterial(options: ArmorBuildOptions) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(options.color),
    metalness: 0.86,
    roughness: 0.24,
    envMapIntensity: 1.1,
    emissive: new THREE.Color(options.emissive),
    emissiveIntensity: 0.22
  });
}

function createVisorMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#111b29'),
    metalness: 0.55,
    roughness: 0.16,
    transparent: true,
    opacity: 0.86
  });
}

function addMesh(group: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0], castShadow = true) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  group.add(mesh);
}

function helmetVariant(variant: number, mat: THREE.Material, visorMat: THREE.Material) {
  const g = new THREE.Group();
  if (variant === 0) {
    addMesh(g, new THREE.IcosahedronGeometry(0.43, 2), mat, [0, 0, 0]);
    addMesh(g, new THREE.CylinderGeometry(0.18, 0.28, 0.24, 20), mat, [0, -0.34, 0.22], [Math.PI / 2, 0, 0]);
  } else if (variant === 1) {
    addMesh(g, new THREE.BoxGeometry(0.72, 0.62, 0.6), mat, [0, 0, 0]);
    addMesh(g, new THREE.CylinderGeometry(0.32, 0.32, 0.5, 12), mat, [0, 0.1, -0.06], [Math.PI / 2, 0, 0]);
  } else {
    addMesh(g, new THREE.OctahedronGeometry(0.47, 1), mat, [0, 0.02, 0]);
    addMesh(g, new THREE.ConeGeometry(0.28, 0.52, 8), mat, [0, 0.22, 0.22], [Math.PI * 0.3, 0, 0]);
  }

  addMesh(g, new THREE.BoxGeometry(0.5, 0.2, 0.03), visorMat, [0, -0.05, 0.29], [0, 0, 0], false);
  return g;
}

function chestVariant(variant: number, mat: THREE.Material, coreMat: THREE.Material) {
  const g = new THREE.Group();
  const base = [new THREE.BoxGeometry(1.05, 1.12, 0.58), new THREE.CapsuleGeometry(0.45, 0.5, 8, 16), new THREE.DodecahedronGeometry(0.6, 1)][variant];
  addMesh(g, base, mat, [0, 0, 0]);
  addMesh(g, new THREE.CylinderGeometry(0.13, 0.13, 0.14, 18), coreMat, [0, 0.06, 0.31], [Math.PI / 2, 0, 0]);
  addMesh(g, new THREE.BoxGeometry(0.82, 0.2, 0.12), mat, [0, 0.42, 0.18]);
  addMesh(g, new THREE.BoxGeometry(0.62, 0.17, 0.1), mat, [0, -0.42, 0.16]);
  return g;
}

function shouldersVariant(variant: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const shape = [new THREE.SphereGeometry(0.29, 18, 14), new THREE.CapsuleGeometry(0.2, 0.22, 6, 12), new THREE.OctahedronGeometry(0.3, 1)][variant];
  addMesh(g, shape, mat, [-0.72, 0, 0.03]);
  addMesh(g, shape.clone(), mat, [0.72, 0, 0.03]);
  return g;
}

function gauntletsVariant(variant: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const shape = [new THREE.CylinderGeometry(0.14, 0.2, 0.62, 10), new THREE.BoxGeometry(0.24, 0.65, 0.26), new THREE.CapsuleGeometry(0.14, 0.35, 4, 10)][variant];
  addMesh(g, shape, mat, [-0.86, 0, 0], [0, 0, Math.PI * 0.08]);
  addMesh(g, shape.clone(), mat, [0.86, 0, 0], [0, 0, -Math.PI * 0.08]);
  return g;
}

function legsVariant(variant: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const thigh = [new THREE.CapsuleGeometry(0.21, 0.58, 6, 12), new THREE.BoxGeometry(0.34, 0.8, 0.36), new THREE.CylinderGeometry(0.18, 0.24, 0.82, 12)][variant];
  addMesh(g, thigh, mat, [-0.33, 0, 0]);
  addMesh(g, thigh.clone(), mat, [0.33, 0, 0]);
  return g;
}

function kneesVariant(variant: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const knee = [new THREE.SphereGeometry(0.16, 16, 12), new THREE.BoxGeometry(0.26, 0.2, 0.28), new THREE.OctahedronGeometry(0.17, 0)][variant];
  addMesh(g, knee, mat, [-0.33, 0, 0.2]);
  addMesh(g, knee.clone(), mat, [0.33, 0, 0.2]);
  return g;
}

function backVariant(variant: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const shell = [new THREE.BoxGeometry(0.8, 0.85, 0.18), new THREE.CylinderGeometry(0.38, 0.36, 0.85, 10), new THREE.CapsuleGeometry(0.28, 0.3, 4, 8)][variant];
  addMesh(g, shell, mat, [0, 0, 0]);
  addMesh(g, new THREE.BoxGeometry(0.4, 0.08, 0.12), mat, [0, -0.42, 0.08]);
  return g;
}

export function createArmorGroup(selection: SuitSelection, options: ArmorBuildOptions) {
  const root = new THREE.Group();
  root.name = 'exo-armor';

  const armorMaterial = createMaterial(options);
  const emissiveCore = new THREE.MeshStandardMaterial({
    color: '#56f5ff',
    emissive: '#56f5ff',
    emissiveIntensity: 1.15,
    metalness: 0.1,
    roughness: 0.05
  });
  const visorMaterial = createVisorMaterial();

  const modules: Record<SuitSection, THREE.Group> = {
    helmet: helmetVariant(selection.helmet, armorMaterial, visorMaterial),
    chest: chestVariant(selection.chest, armorMaterial, emissiveCore),
    shoulders: shouldersVariant(selection.shoulders, armorMaterial),
    gauntlets: gauntletsVariant(selection.gauntlets, armorMaterial),
    legs: legsVariant(selection.legs, armorMaterial),
    knees: kneesVariant(selection.knees, armorMaterial),
    back: backVariant(selection.back, armorMaterial)
  };

  (Object.keys(modules) as SuitSection[]).forEach((key) => {
    const node = modules[key];
    node.position.copy(sectionPositions[key]);
    node.name = key;
    root.add(node);
  });

  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return root;
}

export function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}
