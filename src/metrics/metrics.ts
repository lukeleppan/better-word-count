import type {TAbstractFile} from 'obsidian';
import type BetterWordCount from '../main';
import {debounce, moment} from 'obsidian';
import {ensureVaultMetricsFile} from './validate';
import {
  getWordCount,
  getCharacterCount,
  getSentenceCount,
  getCitationCount,
  getFootnoteCount,
} from '../utils';

/**
 * MetricsManager is responsible for managing the metrics of the vault.
 */
export class MetricsManager {
  private plugin: BetterWordCount;
  private vaultMetrics: VaultMetrics;
  private modifiedFiles: ModifiedFiles;
  public debounceChange;

  /**
   * Creates a new MetricsManager.
   *
   * @param {BetterWordCount} plugin - The plugin to manage the metrics of.
   */
  constructor(plugin: BetterWordCount) {
    this.plugin = plugin;
    this.debounceChange = debounce(
      (text: string) => this.change(text),
      50,
      false
    );

    const vault = this.plugin.app.vault;
    // TODO: confirm this works
    ensureVaultMetricsFile(vault).then(async () => {
      const data = await vault.adapter.read('.obsidian/vault-metrics.json');
      this.vaultMetrics = JSON.parse(data);

      const pluginData = await this.plugin.loadData();
      if (!pluginData?.modifiedFiles) {
        this.modifiedFiles = {
          date: moment().format('YYYY-MM-DD'),
          files: {},
        };
        this.writeModifiedFiles();
      } else if (
        pluginData.modifiedFiles.date !== moment().format('YYYY-MM-DD')
      ) {
        this.modifiedFiles = {
          date: moment().format('YYYY-MM-DD'),
          files: {},
        };
        this.writeModifiedFiles();
      } else {
        this.modifiedFiles = pluginData.modifiedFiles;
      }
    });
  }

  /**
   * Handles data when a file is renamed.
   *
   * @param {TAbstractFile} file - The file that was renamed.
   * @param {string} oldPath - The old path of the file.
   */
  handleRename(file: TAbstractFile, oldPath: string) {
    // TODO: confirm this works
    if (this.modifiedFiles.files[oldPath]) {
      const content = this.modifiedFiles.files[oldPath];
      delete this.modifiedFiles.files[oldPath];
      this.modifiedFiles.files[file.path] = content;
      this.writeModifiedFiles();
      this.updateMetrics();
    }
  }

  /**
   * Handles data when a file is deleted.
   *
   * @param {TAbstractFile} file - The file that was deleted.
   */
  handleDelete(file: TAbstractFile) {
    // TODO: confirm this works
    if (this.modifiedFiles.files[file.path]) {
      delete this.modifiedFiles.files[file.path];
      this.writeModifiedFiles();
      this.updateMetrics();
    }
  }

  writeModifiedFiles() {
    const data = this.plugin.getData();
    data.modifiedFiles = this.modifiedFiles;
    this.plugin.properSaveData(data);
  }

  async updateMetrics() {
    const date = this.modifiedFiles.date;
    const storedMetrics = this.plugin.getData().settings.storedMetrics;
    for (const metric in this.vaultMetrics.history[date]) {
      this.vaultMetrics.history[date][metric].i = 0;
      this.vaultMetrics.history[date][metric].c = 0;
    }
    for (const file in this.modifiedFiles.files) {
      const metrics = this.modifiedFiles.files[file];
      for (const metric in metrics) {
        if (storedMetrics[metric]) {
          if (!this.vaultMetrics.history[date][metric]) {
            const value = await this.evaluateMetricID(metric);
            this.vaultMetrics.history[date][metric] = {
              i: value,
              c: value,
            };
          }
          this.vaultMetrics.history[date][metric].c += metrics[metric].c;
        }
      }
    }
  }

  ensureDate(date: string) {
    if (!this.vaultMetrics.history[date]) {
      this.vaultMetrics.history[date] = {};
    }
  }

  async evaluateMetricID(metricID: string): Promise<number> {
    const metric: Metric =
      this.plugin.getData().settings.storedMetrics[metricID];
    let operationMetricValue = 0;
    if (metric.operationalMetric) {
      if (typeof metric.operationalMetric === 'number') {
        operationMetricValue = metric.operationalMetric;
      } else {
        operationMetricValue = await this.evaluateMetricID(
          metric.operationalMetric.id
        );
      }
    }

    let value: number;
    switch (metric.coreMetric) {
      case 'words':
        value = await this.evaluteCoreTextMetric(
          metric.condition,
          getWordCount
        );
        break;
      case 'characters':
        value = await this.evaluteCoreTextMetric(
          metric.condition,
          getCharacterCount
        );
        break;
      case 'sentences':
        value = await this.evaluteCoreTextMetric(
          metric.condition,
          getSentenceCount
        );
        break;
      case 'citations':
        value = await this.evaluteCoreTextMetric(
          metric.condition,
          getCitationCount
        );
        break;
      case 'footnotes':
        value = await this.evaluteCoreTextMetric(
          metric.condition,
          getFootnoteCount
        );
        break;
      case 'notes':
        //TOFO handle notes
        value = 0;
        break;
      default:
        value = 0;
        break;
    }

    if (metric.operation === 'add') {
      return value + operationMetricValue;
    } else if (metric.operation === 'subtract') {
      return value - operationMetricValue;
    } else if (metric.operation === 'multiply' && operationMetricValue !== 0) {
      return value * operationMetricValue;
    } else if (metric.operation === 'divide' && operationMetricValue !== 0) {
      return value / operationMetricValue;
    } else {
      return value;
    }
  }

  async evaluteCoreTextMetric(
    condition: MetricCondition,
    metricFunction: (text: string) => number
  ): Promise<number> {
    const vault = this.plugin.app.vault;
    let value = 0;
    if (condition.type === 'in-vault') {
      for (const file of vault.getFiles()) {
        const text = await vault.cachedRead(file);
        value += metricFunction(text);
      }
    } else if (condition.type === 'in-paths') {
      for (const file of vault.getFiles()) {
        for (const path of condition.options?.paths) {
          if (file.path.startsWith(path)) {
            const text = await vault.cachedRead(file);
            value += metricFunction(text);
          }
        }
        const text = await vault.read(file);
        value += metricFunction(text);
      }
    } else if (condition.type === 'exclude-paths') {
      for (const file of vault.getFiles()) {
        let include = true;
        for (const path of condition.options?.paths) {
          if (file.path.startsWith(path)) {
            include = false;
          }
        }
        if (include) {
          const text = await vault.cachedRead(file);
          value += metricFunction(text);
        }
      }
    }

    return value;
  }

  change(text: string) {
    this.updateMetrics();
  }
}
