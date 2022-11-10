export interface VaultStatistics {
  history: History;
  modifiedFiles: ModifiedFiles;
}

export type History = Record<string, Day>;

export interface Day {
  words: number;
  characters: number;
  sentences: number;
  files: number;
  totalWords: number;
  totalCharacters: number;
  totalSentences: number;
}

export type ModifiedFiles = Record<string, FileStat>;

export interface FileStat {
  words: CountDiff;
  characters: CountDiff;
  sentences: CountDiff;
}

export interface CountDiff {
  initial: number;
  current: number;
}
