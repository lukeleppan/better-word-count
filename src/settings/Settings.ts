export enum Counter {
  fileWords,
  fileChars,
  totalWords,
  totalChars,
}

export interface StatusBarItem {
  start: string;
  end: string;
  count: Counter;
}

export const BLANK_SB_ITEM: StatusBarItem = {
  start: "",
  end: "",
  count: null,
};

export interface BetterWordCountSettings {
  statusBar: StatusBarItem[];
  countComments: boolean;
  collectStats: boolean;
}

export const DEFAULT_SETTINGS: BetterWordCountSettings = {
  statusBar: [
    {
      start: "",
      end: " words",
      count: Counter.fileWords,
    },
    {
      start: " ",
      end: " characters",
      count: Counter.fileChars,
    },
  ],
  countComments: false,
  collectStats: false,
};
