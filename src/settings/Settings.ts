export type MetricType =
  | "words"
  | "chars"
  | "sents"
  | "blocks"
  | "lines"
  | "notes"
  | "files";

export interface Metric {
  variant: "current" | "daily" | "total" | "file" | "folder";
  metricType: MetricType;
  path?: string;
  date?: string;
  operations: MetricOperation[];
}

export interface MetricOperation {
  operation: "+" | "-" | "*" | "/";
  metricOrValue: Metric | number;
}

export interface StatusBarItem {
  prefix: string;
  suffix: string;
  metric: Metric;
}

export interface StatusBar {
  views: string[];
  items: StatusBarItem[];
}

export const BLANK_SB_ITEM: StatusBarItem = {
  prefix: "",
  suffix: "",
  metric: null,
};

export interface BetterWordCountSettings {
  statusBars: StatusBar[];
  countComments: boolean;
  collectStats: boolean;
  storedStats: {
    words?: boolean;
    chars?: boolean;
    sents?: boolean;
    blocks?: boolean;
    lines?: boolean;
    notes?: boolean;
    files?: boolean;
  };
}

export const DEFAULT_SETTINGS: BetterWordCountSettings = {
  statusBars: [
    {
      views: ["markdown"],
      items: [
        {
          prefix: "",
          suffix: " words",
          metric: {
            variant: "current",
            metricType: "words",
            operations: [],
          },
        },
        {
          prefix: " ",
          suffix: " characters",
          metric: {
            variant: "current",
            metricType: "chars",
            operations: [],
          },
        },
      ],
    },
    {
      views: ["default"],
      items: [
        {
          prefix: "",
          suffix: " files",
          metric: {
            variant: "total",
            metricType: "files",
            operations: [],
          },
        },
      ],
    },
  ],
  countComments: false,
  collectStats: false,
  storedStats: {
    words: false,
    chars: false,
    sents: false,
    blocks: false,
    lines: false,
    notes: false,
    files: false,
  },
};
