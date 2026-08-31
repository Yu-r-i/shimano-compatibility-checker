export type PartCategory = "shifter" | "rear_derailleur" | "cassette" | "chain";

export interface Part {
  id: string;
  category: PartCategory;
  brand?: string;
  series?: string;
  speed?: number;
  actuation?: string;
  brake_type?: string;
  mount_type?: string;
  brake_pull?: string;
  segment?: string;
  max_sprocket?: number;
  capacity?: number;
  cage?: string;
  freehub?: string;
  range?: [number, number];
  chain_type?: string;
}

export interface CompatibilitySelection {
  shifterId: string;
  rearDerailleurId: string;
  cassetteId: string;
  chainId: string;
}

export interface CompatibilityResult {
  ok: boolean;
  reasons: string[];
}
