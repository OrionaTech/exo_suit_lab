const prefixes = ['Aegis', 'Nova', 'Vortex', 'Titan', 'Ion', 'Zenith', 'Helix', 'Quantum'];
const middle = ['Prime', 'Arc', 'Pulse', 'Core', 'Specter', 'Sentinel', 'Flux', 'Strata'];
const suffixes = ['X7', 'MK-II', '9', 'VX', 'ALPHA', '7R', 'NOVA', 'R3'];

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSuitName() {
  const includeMiddle = Math.random() > 0.35;
  const model = randomFrom(suffixes);
  const base = includeMiddle ? `${randomFrom(prefixes)} ${randomFrom(middle)}` : randomFrom(prefixes);
  return `${base}-${model}`.replace('--', '-');
}

export function generateVersionId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
