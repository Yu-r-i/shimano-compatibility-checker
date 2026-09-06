-- 既存4カテゴリ(shifter/rear_derailleur/cassette/chain)から
-- Shimanoコンポーネント全種(13カテゴリ)へスキーマを拡張する。
-- SQLite/D1はCHECK制約のALTERを直接サポートしないため、テーブルを再作成して移行する。

CREATE TABLE parts_new (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN (
    'shifter',
    'brake_lever',
    'front_derailleur',
    'rear_derailleur',
    'crankset',
    'bottom_bracket',
    'cassette',
    'freewheel',
    'chain',
    'brake_caliper',
    'disc_rotor',
    'hub',
    'pedal'
  )),
  brand TEXT,
  series TEXT,
  speed INTEGER,
  actuation TEXT,
  brake_type TEXT,
  mount_type TEXT,
  brake_pull TEXT,
  required_pull TEXT,
  segment TEXT,
  max_sprocket INTEGER,
  capacity INTEGER,
  cage TEXT,
  freehub TEXT,
  range_min INTEGER,
  range_max INTEGER,
  chain_type TEXT,
  crank_teeth TEXT,
  crank_spindle TEXT,
  disc_mount TEXT,
  rotor_size INTEGER,
  bb_shell TEXT,
  cleat_type TEXT
);

INSERT INTO parts_new (
  id, category, brand, series, speed, actuation, brake_type, mount_type, brake_pull,
  required_pull, segment, max_sprocket, capacity, cage, freehub, range_min, range_max, chain_type
)
SELECT
  id, category, brand, series, speed, actuation, brake_type, mount_type, brake_pull,
  required_pull, segment, max_sprocket, capacity, cage, freehub, range_min, range_max, chain_type
FROM parts;

DROP TABLE parts;
ALTER TABLE parts_new RENAME TO parts;

CREATE INDEX idx_parts_category ON parts(category);
