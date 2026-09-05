CREATE TABLE parts (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('shifter', 'rear_derailleur', 'cassette', 'chain')),
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
  chain_type TEXT
);

CREATE INDEX idx_parts_category ON parts(category);
