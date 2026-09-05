import type { Part, PartCategory } from "../types";

interface PartRow {
  id: string;
  category: string;
  brand: string | null;
  series: string | null;
  speed: number | null;
  actuation: string | null;
  brake_type: string | null;
  mount_type: string | null;
  brake_pull: string | null;
  required_pull: string | null;
  segment: string | null;
  max_sprocket: number | null;
  capacity: number | null;
  cage: string | null;
  freehub: string | null;
  range_min: number | null;
  range_max: number | null;
  chain_type: string | null;
}

function rowToPart(row: PartRow): Part {
  const part: Part = {
    id: row.id,
    category: row.category as PartCategory,
  };

  if (row.brand != null) part.brand = row.brand;
  if (row.series != null) part.series = row.series;
  if (row.speed != null) part.speed = row.speed;
  if (row.actuation != null) part.actuation = row.actuation;
  if (row.brake_type != null) part.brake_type = row.brake_type;
  if (row.mount_type != null) part.mount_type = row.mount_type;
  if (row.brake_pull != null) part.brake_pull = row.brake_pull;
  if (row.required_pull != null) part.required_pull = row.required_pull;
  if (row.segment != null) part.segment = row.segment;
  if (row.max_sprocket != null) part.max_sprocket = row.max_sprocket;
  if (row.capacity != null) part.capacity = row.capacity;
  if (row.cage != null) part.cage = row.cage;
  if (row.freehub != null) part.freehub = row.freehub;
  if (row.range_min != null && row.range_max != null) part.range = [row.range_min, row.range_max];
  if (row.chain_type != null) part.chain_type = row.chain_type;

  return part;
}

export async function getAllParts(db: D1Database): Promise<Part[]> {
  const { results } = await db.prepare("SELECT * FROM parts").all<PartRow>();
  return results.map(rowToPart);
}

export async function getPartsByCategory(db: D1Database, category: string): Promise<Part[]> {
  const { results } = await db
    .prepare("SELECT * FROM parts WHERE category = ?")
    .bind(category)
    .all<PartRow>();
  return results.map(rowToPart);
}

export async function getPartById(db: D1Database, id: string): Promise<Part | undefined> {
  const row = await db.prepare("SELECT * FROM parts WHERE id = ?").bind(id).first<PartRow>();
  return row ? rowToPart(row) : undefined;
}
