export interface VaultStatistics {
  history: History;
  modifiedFiles?: ModifiedFiles;
}

export type History = Record<string, StoreMetrics>;

export type ModifiedFiles = Record<string, StoreMetrics>;

export interface StoreMetrics {
  words?: CountDiff;
  chars?: CountDiff;
  sents?: CountDiff;
  blocks?: CountDiff;
  lines?: CountDiff;
  notes?: CountDiff;
  files?: CountDiff;
}

export interface CountDiff {
  initial: number;
  current: number;
}
