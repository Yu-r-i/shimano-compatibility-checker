export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

export type PartCategory =
  | "shifter"
  | "brake_lever"
  | "front_derailleur"
  | "rear_derailleur"
  | "crankset"
  | "bottom_bracket"
  | "cassette"
  | "freewheel"
  | "chain"
  | "brake_caliper"
  | "disc_rotor"
  | "hub"
  | "pedal";

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
  required_pull?: string;
  segment?: string;
  max_sprocket?: number;
  capacity?: number;
  cage?: string;
  freehub?: string;
  range?: [number, number];
  chain_type?: string;
  crank_teeth?: number[];
  crank_spindle?: string;
  disc_mount?: string;
  rotor_size?: number;
  bb_shell?: string;
  cleat_type?: string;
}

/**
 * 診断選択状態。カテゴリごとに任意(部分選択可)。
 * 2カテゴリ以上選択されると、該当するペアの互換ルールのみが評価される。
 */
export type CompatibilitySelection = Partial<Record<PartCategory, string>>;

export interface RuleResult {
  ok: boolean;
  reasons: string[];
}
