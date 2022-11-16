export enum Counter {
  fileWords,
  fileChars,
  fileSentences,
  totalWords,
  totalChars,
  totalSentences,
  totalNotes,
}

export interface StatusBarItem {
  prefix: string;
  suffix: string;
  count: Counter;
}

export const BLANK_SB_ITEM: StatusBarItem = {
  prefix: "",
  suffix: "",
  count: null,
};

export interface BetterWordCountSettings {
  statusBar: StatusBarItem[];
  countComments: boolean;
  collectStats: boolean;
}

export const DEFAULT_SETTINGS: BetterWordCountSettings = Object.freeze({
  statusBar: [
    {
      prefix: "",
      suffix: " words",
      count: Counter.fileWords,
    },
    {
      prefix: " ",
      suffix: " characters",
      count: Counter.fileChars,
    },
  ],
  countComments: false,
  collectStats: false,
});
