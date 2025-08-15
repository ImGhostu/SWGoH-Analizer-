
export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  factions: string[];
  synergies?: string[];
  galacticPower: number;
  speed: number;
}

export type Squad = (Character | null)[];
