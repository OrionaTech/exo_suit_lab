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
    metalness: 0.9,
    roughness: 0.21,
    envMapIntensity: 1.25,
    emissive: new THREE.Color(options.emissive),
    emissiveIntensity: 0.2
  });
}

function createTrimMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#8bc6d3',
    metalness: 1,
    roughness: 0.12,
    envMapIntensity: 1.35
  });
}

function createVisorMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: '#111b29',
    metalness: 0.65,
    roughness: 0.08,
    transmission: 0.24,
    thickness: 0.6,
    transparent: true,
    opacity: 0.92
  });
}

function addMesh(
  group: THREE.Group,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos: [number, number, number],
  rot: [number, number, number] = [0, 0, 0],
  castShadow = true
) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  group.add(mesh);
}

function createMaskPlateGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.26, -0.13);
  shape.quadraticCurveTo(0, -0.2, 0.26, -0.13);
  shape.lineTo(0.24, 0.12);
  shape.quadraticCurveTo(0, 0.2, -0.24, 0.12);
  shape.lineTo(-0.26, -0.13);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
}

function helmetVariant(variant: number, mat: THREE.Material, visorMat: THREE.Material, trimMat: THREE.Material) {
  const g = new THREE.Group();
  if (variant === 0) {
    addMesh(g, new THREE.IcosahedronGeometry(0.44, 2), mat, [0, 0.02, 0]);
    addMesh(g, new THREE.CylinderGeometry(0.18, 0.29, 0.25, 20), mat, [0, -0.33, 0.22], [Math.PI / 2, 0, 0]);
  } else if (variant === 1) {
    addMesh(g, new THREE.CapsuleGeometry(0.34, 0.3, 10, 16), mat, [0, 0.04, -0.04]);
    addMesh(g, new THREE.BoxGeometry(0.66, 0.34, 0.5), mat, [0, -0.2, 0.1]);
  } else {
    addMesh(g, new THREE.OctahedronGeometry(0.47, 1), mat, [0, 0.03, 0]);
    addMesh(g, new THREE.ConeGeometry(0.2, 0.45, 6), trimMat, [0, 0.28, 0.19], [Math.PI * 0.35, 0, 0]);
  }

  addMesh(g, new THREE.BoxGeometry(0.52, 0.2, 0.03), visorMat, [0, -0.05, 0.3], [0, 0, 0], false);
  addMesh(g, createMaskPlateGeometry(), trimMat, [0, -0.23, 0.24], [0, 0, 0], false);
  addMesh(g, new THREE.TorusGeometry(0.08, 0.015, 8, 22), trimMat, [-0.12, -0.25, 0.3], [Math.PI / 2, 0, 0], false);
  addMesh(g, new THREE.TorusGeometry(0.08, 0.015, 8, 22), trimMat, [0.12, -0.25, 0.3], [Math.PI / 2, 0, 0], false);
  return g;
}

function chestVariant(variant: number, mat: THREE.Material, coreMat: THREE.Material, trimMat: THREE.Material) {
  const g = new THREE.Group();
  const base =
    [new THREE.BoxGeometry(1.06, 1.14, 0.6), new THREE.CapsuleGeometry(0.46, 0.52, 8, 18), new THREE.DodecahedronGeometry(0.62, 1)][
      variant
    ];
  addMesh(g, base, mat, [0, 0, 0]);
  addMesh(g, new THREE.CylinderGeometry(0.14, 0.14, 0.15, 20), coreMat, [0, 0.05, 0.31], [Math.PI / 2, 0, 0]);
  addMesh(g, new THREE.TorusGeometry(0.2, 0.03, 10, 30), trimMat, [0, 0.05, 0.3], [Math.PI / 2, 0, 0]);
  addMesh(g, new THREE.BoxGeometry(0.84, 0.2, 0.12), mat, [0, 0.42, 0.18]);
  addMesh(g, new THREE.BoxGeometry(0.62, 0.17, 0.1), mat, [0, -0.42, 0.16]);
  return g;
}

function shouldersVariant(variant: number, mat: THREE.Material, trimMat: THREE.Material) {
  const g = new THREE.Group();
  const shape =
    [new THREE.SphereGeometry(0.29, 18, 14), new THREE.CapsuleGeometry(0.2, 0.22, 6, 12), new THREE.OctahedronGeometry(0.3, 1)][
      variant
    ];
  addMesh(g, shape, mat, [-0.72, 0, 0.03]);
  addMesh(g, shape.clone(), mat, [0.72, 0, 0.03]);
  addMesh(g, new THREE.TorusGeometry(0.23, 0.018, 8, 24), trimMat, [-0.72, -0.02, 0.03], [0, Math.PI / 2, 0]);
  addMesh(g, new THREE.TorusGeometry(0.23, 0.018, 8, 24), trimMat, [0.72, -0.02, 0.03], [0, Math.PI / 2, 0]);
  return g;
}

function gauntletsVariant(variant: number, mat: THREE.Material, trimMat: THREE.Material) {
  const g = new THREE.Group();
  const shape =
    [new THREE.CylinderGeometry(0.14, 0.2, 0.62, 10), new THREE.BoxGeometry(0.24, 0.65, 0.26), new THREE.CapsuleGeometry(0.14, 0.35, 4, 10)][
      variant
    ];
  addMesh(g, shape, mat, [-0.86, 0, 0], [0, 0, Math.PI * 0.08]);
  addMesh(g, shape.clone(), mat, [0.86, 0, 0], [0, 0, -Math.PI * 0.08]);
  addMesh(g, new THREE.BoxGeometry(0.08, 0.28, 0.3), trimMat, [-0.86, -0.26, 0.02], [0, 0, Math.PI * 0.08]);
  addMesh(g, new THREE.BoxGeometry(0.08, 0.28, 0.3), trimMat, [0.86, -0.26, 0.02], [0, 0, -Math.PI * 0.08]);
  return g;
}

function legsVariant(variant: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const thigh =
    [new THREE.CapsuleGeometry(0.21, 0.58, 6, 12), new THREE.BoxGeometry(0.34, 0.8, 0.36), new THREE.CylinderGeometry(0.18, 0.24, 0.82, 12)][
      variant
    ];
  addMesh(g, thigh, mat, [-0.33, 0, 0]);
  addMesh(g, thigh.clone(), mat, [0.33, 0, 0]);
  return g;
}

function kneesVariant(variant: number, mat: THREE.Material, trimMat: THREE.Material) {
  const g = new THREE.Group();
  const knee = [new THREE.SphereGeometry(0.16, 16, 12), new THREE.BoxGeometry(0.26, 0.2, 0.28), new THREE.OctahedronGeometry(0.17, 0)][variant];
  addMesh(g, knee, mat, [-0.33, 0, 0.2]);
  addMesh(g, knee.clone(), mat, [0.33, 0, 0.2]);
  addMesh(g, new THREE.TorusGeometry(0.1, 0.012, 8, 24), trimMat, [-0.33, 0, 0.2], [Math.PI / 2, 0, 0]);
  addMesh(g, new THREE.TorusGeometry(0.1, 0.012, 8, 24), trimMat, [0.33, 0, 0.2], [Math.PI / 2, 0, 0]);
  return g;
}

function backVariant(variant: number, mat: THREE.Material, coreMat: THREE.Material) {
  const g = new THREE.Group();
  const shell =
    [new THREE.BoxGeometry(0.8, 0.85, 0.18), new THREE.CylinderGeometry(0.38, 0.36, 0.85, 10), new THREE.CapsuleGeometry(0.28, 0.3, 4, 8)][
      variant
    ];
  addMesh(g, shell, mat, [0, 0, 0]);
  addMesh(g, new THREE.BoxGeometry(0.4, 0.08, 0.12), mat, [0, -0.42, 0.08]);
  addMesh(g, new THREE.CylinderGeometry(0.06, 0.06, 0.22, 18), coreMat, [0, 0.1, -0.1], [Math.PI / 2, 0, 0]);
  return g;
}

export function createArmorGroup(selection: SuitSelection, options: ArmorBuildOptions) {
  const root = new THREE.Group();
  root.name = 'exo-armor';

  const armorMaterial = createMaterial(options);
  const emissiveCore = new THREE.MeshStandardMaterial({
    color: '#56f5ff',
    emissive: '#56f5ff',
    emissiveIntensity: 1.2,
    metalness: 0.1,
    roughness: 0.05
  });
  const visorMaterial = createVisorMaterial();
  const trimMaterial = createTrimMaterial();

  const modules: Record<SuitSection, THREE.Group> = {
    helmet: helmetVariant(selection.helmet, armorMaterial, visorMaterial, trimMaterial),
    chest: chestVariant(selection.chest, armorMaterial, emissiveCore, trimMaterial),
    shoulders: shouldersVariant(selection.shoulders, armorMaterial, trimMaterial),
    gauntlets: gauntletsVariant(selection.gauntlets, armorMaterial, trimMaterial),
    legs: legsVariant(selection.legs, armorMaterial),
    knees: kneesVariant(selection.knees, armorMaterial, trimMaterial),
    back: backVariant(selection.back, armorMaterial, emissiveCore)
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
