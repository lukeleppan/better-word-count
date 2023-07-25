export enum MetricCounter {
  words,
  characters,
  sentences,
  footnotes,
  citations,
  pages,
  files,
}

export enum MetricType {
  file,
  daily,
  total,
  folder,
}

export interface Metric {
  type: MetricType;
  counter: MetricCounter;
  folder?: string;
}

export interface StatusBarItem {
  prefix: string;
  suffix: string;
  metric: Metric;
}

export const BLANK_SB_ITEM: StatusBarItem = {
  prefix: "",
  suffix: "",
  metric: {
    type: null,
    counter: null,
  },
};

export interface BetterWordCountSettings {
  statusBar: StatusBarItem[];
  altBar: StatusBarItem[];
  countComments: boolean;
  collectStats: boolean;
  pageWords: number;
  displaySectionCounts: boolean;
}

export const DEFAULT_SETTINGS: BetterWordCountSettings = {
  statusBar: [
    {
      prefix: "",
      suffix: " words",
      metric: {
        type: MetricType.file,
        counter: MetricCounter.words,
      },
    },
    {
      prefix: " ",
      suffix: " characters",
      metric: {
        type: MetricType.file,
        counter: MetricCounter.characters,
      },
    },
  ],
  altBar: [
    {
      prefix: "",
      suffix: " files",
      metric: {
        type: MetricType.total,
        counter: MetricCounter.files,
      },
    },
  ],
  countComments: false,
  collectStats: false,
  displaySectionCounts: false,
  pageWords: 300,
};
