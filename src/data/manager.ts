import moment from "moment";
import type { TAbstractFile, Vault } from "obsidian";
import { STATS_FILE } from "src/constants";
import { DataCollector } from "./collector";

export class DataManager {
  private vault: Vault;
  private stats: any;
  private index: number;
  private collector: DataCollector;

  constructor(vault: Vault) {
    this.vault = vault;
    this.collector = new DataCollector(vault);

    this.vault.adapter.exists(".vault-stats").then(async (exists) => {
      if (!exists) {
        const json: string = JSON.stringify({
          history: [],
        });

        this.vault.adapter.write(".vault-stats", json);
      }

      this.stats = JSON.parse(await this.vault.adapter.read(".vault-stats"));
      this.getTodayIndex();

      this.update();
    });
  }

  async update(): Promise<void> {
    this.vault.adapter.write(STATS_FILE, JSON.stringify(this.stats));
  }

  getTodayIndex(): void {
    const length: number = this.stats.history.length;

    if (length === 0) {
      this.index =
        this.stats.history.push({
          date: moment().format("YYYY-MM-DD"),
          initFiles: 0,
          finalFiles: 0,
          modifiedFiles: [],
          words: 0,
          characters: 0,
          sentences: 0,
          totalWords: 0,
          totalCharacters: 0,
          totalSentences: 0,
        }) - 1;
    } else if (
      this.stats.history[this.stats.history.length - 1].date ===
      moment().format("YYYY-MM-DD")
    ) {
      this.index = this.stats.history.length - 1;
    } else {
      this.index =
        this.stats.history.push({
          date: moment().format("YYYY-MM-DD"),
          initFiles: 0,
          finalFiles: 0,
          modifiedFiles: [],
          words: 0,
          characters: 0,
          sentences: 0,
          totalWords: 0,
          totalCharacters: 0,
          totalSentences: 0,
        }) - 1;
    }
  }

  onVaultModify(file: TAbstractFile) {
    if (!this.stats.history[this.index].modifiedFiles.includes(file.name)) {
      this.stats.history[this.index].modifiedFiles.push(file.name);
      this.update();
    }
  }

  change(cm: CodeMirror.Editor) {}

  setTotalStats() {}
}
