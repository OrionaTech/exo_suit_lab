export type StatKey = 'power' | 'speed' | 'defense' | 'intelligence' | 'energy';

export type StatProfile = Record<StatKey, number>;

export type SuitSection = 'helmet' | 'chest' | 'arms' | 'legs';

export type SuitSelection = Record<SuitSection, number>;

const partStats: Record<SuitSection, StatProfile[]> = {
  helmet: [
    { power: 14, speed: 18, defense: 12, intelligence: 24, energy: 22 },
    { power: 20, speed: 12, defense: 18, intelligence: 20, energy: 17 },
    { power: 16, speed: 16, defense: 14, intelligence: 26, energy: 18 }
  ],
  chest: [
    { power: 28, speed: 8, defense: 30, intelligence: 16, energy: 25 },
    { power: 24, speed: 14, defense: 24, intelligence: 18, energy: 27 },
    { power: 20, speed: 18, defense: 20, intelligence: 22, energy: 29 }
  ],
  arms: [
    { power: 27, speed: 15, defense: 20, intelligence: 10, energy: 18 },
    { power: 22, speed: 20, defense: 18, intelligence: 14, energy: 19 },
    { power: 18, speed: 24, defense: 16, intelligence: 17, energy: 20 }
  ],
  legs: [
    { power: 18, speed: 26, defense: 18, intelligence: 12, energy: 16 },
    { power: 22, speed: 20, defense: 20, intelligence: 14, energy: 18 },
    { power: 24, speed: 16, defense: 22, intelligence: 16, energy: 21 }
  ]
};

export function computeSuitStats(selection: SuitSelection) {
  const total = (Object.keys(partStats) as SuitSection[]).reduce<StatProfile>(
    (acc, section) => {
      const profile = partStats[section][selection[section]];
      acc.power += profile.power;
      acc.speed += profile.speed;
      acc.defense += profile.defense;
      acc.intelligence += profile.intelligence;
      acc.energy += profile.energy;
      return acc;
    },
    { power: 0, speed: 0, defense: 0, intelligence: 0, energy: 0 }
  );

  const score = Object.values(total).reduce((sum, value) => sum + value, 0);
  const tier = score >= 320 ? 'S' : score >= 260 ? 'A' : score >= 200 ? 'B' : 'C';

  return { total, score, tier };
}

export { partStats };
