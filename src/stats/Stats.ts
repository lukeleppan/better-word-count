export interface VaultStatistics {
  history: History;
  modifiedFiles: ModifiedFiles;
}

export type History = Record<string, Day>;

export interface Day {
  words: number;
  characters: number;
  sentences: number;
  pages: number;
  files: number;
  footnotes: number;
  citations: number;
  totalWords: number;
  totalCharacters: number;
  totalSentences: number;
  totalFootnotes: number;
  totalCitations: number;
  totalPages: number;
}

export type ModifiedFiles = Record<string, FileStat>;

export interface FileStat {
  footnotes: CountDiff;
  citations: CountDiff;
  words: CountDiff;
  characters: CountDiff;
  sentences: CountDiff;
  pages: CountDiff;
}

export interface CountDiff {
  initial: number;
  current: number;
}
