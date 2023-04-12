interface VaultMetrics {
  version?: number;
  history: History;
  modifiedFiles: ModifiedFiles;
}

interface History {
  [date: string]: Metrics;
}

interface ModifiedFiles {
  date: string;
  files: {
    [path: string]: Metrics;
  };
}

interface Metrics {
  [metric: string]: MetricDiff;
}

interface MetricDiff {
  i: number;
  c: number;
}
