interface BWCSettings {
  sanitisation: {
    removeMDComments: boolean;
    removeHTMLComments: boolean;
  };
  storedMetrics: {
    [metric: string]: Metric;
  };
  statusBars: StatusBar[];
}

interface Metric {
  id: string;
  coreMetric: CoreMetric;
  condition: MetricCondition;
  operation: MetricOperation;
  operationalMetric: Metric | number;
}

type CoreMetric =
  | 'words'
  | 'characters'
  | 'sentences'
  | 'paragraphs'
  | 'lines'
  | 'footnotes'
  | 'citations'
  | 'notes';

interface MetricCondition {
  type: MetricConditionType;
  options?: {
    paths?: string[];
  };
}

type MetricConditionType = 'in-vault' | 'in-paths' | 'exclude-paths';

type MetricOperation = 'add' | 'subtract' | 'multiply' | 'divide';

interface StatusBar {
  views: string[];
  items: DisplayMetric[];
}

interface DisplayMetric {
  id: string;
  formatting: {
    prefix: string;
    suffix: string;
  };
}
