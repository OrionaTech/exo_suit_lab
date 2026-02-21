export type StatKey = 'power' | 'speed' | 'defense' | 'intelligence' | 'energy';
export type StatProfile = Record<StatKey, number>;

export type SuitSection = 'helmet' | 'chest' | 'shoulders' | 'gauntlets' | 'legs' | 'knees' | 'back';
export type SuitSelection = Record<SuitSection, number>;

export const partStats: Record<SuitSection, StatProfile[]> = {
  helmet: [
    { power: 16, speed: 15, defense: 18, intelligence: 25, energy: 19 },
    { power: 18, speed: 13, defense: 22, intelligence: 20, energy: 18 },
    { power: 14, speed: 18, defense: 16, intelligence: 27, energy: 21 }
  ],
  chest: [
    { power: 34, speed: 8, defense: 34, intelligence: 14, energy: 30 },
    { power: 28, speed: 12, defense: 30, intelligence: 18, energy: 33 },
    { power: 24, speed: 16, defense: 24, intelligence: 22, energy: 36 }
  ],
  shoulders: [
    { power: 18, speed: 11, defense: 20, intelligence: 8, energy: 9 },
    { power: 15, speed: 15, defense: 17, intelligence: 10, energy: 10 },
    { power: 13, speed: 17, defense: 14, intelligence: 12, energy: 11 }
  ],
  gauntlets: [
    { power: 26, speed: 14, defense: 18, intelligence: 11, energy: 12 },
    { power: 22, speed: 18, defense: 16, intelligence: 14, energy: 14 },
    { power: 18, speed: 22, defense: 14, intelligence: 16, energy: 15 }
  ],
  legs: [
    { power: 22, speed: 24, defense: 21, intelligence: 10, energy: 12 },
    { power: 24, speed: 20, defense: 24, intelligence: 11, energy: 13 },
    { power: 20, speed: 28, defense: 18, intelligence: 12, energy: 11 }
  ],
  knees: [
    { power: 7, speed: 8, defense: 14, intelligence: 4, energy: 5 },
    { power: 8, speed: 7, defense: 16, intelligence: 4, energy: 5 },
    { power: 6, speed: 10, defense: 12, intelligence: 5, energy: 6 }
  ],
  back: [
    { power: 16, speed: 9, defense: 20, intelligence: 11, energy: 15 },
    { power: 13, speed: 11, defense: 18, intelligence: 14, energy: 16 },
    { power: 11, speed: 14, defense: 15, intelligence: 17, energy: 18 }
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
