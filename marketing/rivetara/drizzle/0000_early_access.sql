CREATE TABLE early_access_signups (
  email TEXT PRIMARY KEY NOT NULL,
  consent_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
