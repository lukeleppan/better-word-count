import { MetadataCache, Vault, Debouncer, debounce } from "obsidian";
import { DataCollector } from "src/data/collector";
import { DataManager } from "src/data/manager";
import type { TodayCounts } from "src/data/manager";
import type { BetterWordCountSettings } from "src/settings/settings";
import {
  getWordCount,
  getCharacterCount,
  getSentenceCount,
  cleanComments,
} from "../data/stats";
import type { StatusBar } from "./bar";
import { Expression, parse } from "./parse";

export class BarManager {
  private statusBar: StatusBar;
  private settings: BetterWordCountSettings;
  private vault: Vault;
  private dataCollector: DataCollector;
  private dataManager: DataManager;
  private deboucer: Debouncer<[text: string]>;
  private expression: Expression;

  constructor(
    statusBar: StatusBar,
    settings: BetterWordCountSettings,
    vault: Vault,
    metadataCache: MetadataCache
  ) {
    this.statusBar = statusBar;
    this.settings = settings;
    this.vault = vault;
    this.dataCollector = new DataCollector(vault, metadataCache);
    this.dataManager = new DataManager(vault, metadataCache);
    this.deboucer = debounce(
      (text: string) => this.updateStatusBar(text),
      20,
      false
    );
    this.expression = parse(this.settings.statusBarQuery);
  }

  updateStatusBar(text: string): void {
    let newText = "";

    if (this.settings.collectStats) {
      this.dataManager.updateTodayCounts();
    }
    const todayCounts: TodayCounts = this.settings.collectStats
      ? this.dataManager.getTodayCounts()
      : { words: 0, characters: 0, sentences: 0 };

    let varsIndex = 0;
    for (const i in this.expression.parsed) {
      const e = this.expression.parsed[i];
      newText = newText + e;
      switch (this.expression.vars[varsIndex]) {
        case 0:
          newText = newText + getWordCount(text);
          break;
        case 1:
          newText = newText + getCharacterCount(text);
          break;
        case 2:
          newText = newText + getSentenceCount(text);
          break;
        case 3:
          newText = newText + this.dataManager.getTotalCounts().words;
          break;
        case 4:
          newText = newText + this.dataManager.getTotalCounts().characters;
          break;
        case 5:
          newText = newText + this.dataManager.getTotalCounts().sentences;
          break;
        case 6:
          newText = newText + this.dataCollector.getTotalFileCount();
          break;
        case 7:
          newText = newText + todayCounts.words;
          break;
        case 8:
          newText = newText + todayCounts.characters;
          break;
        case 9:
          newText = newText + todayCounts.sentences;
          break;
      }
      varsIndex++;
    }

    this.statusBar.displayText(newText);
  }

  async updateAltStatusBar(): Promise<void> {
    let newText = "";
    const expression: Expression = parse(this.settings.statusBarAltQuery);
    if (this.settings.collectStats) {
      this.dataManager.updateTodayCounts();
    }

    const todayCounts: TodayCounts = this.settings.collectStats
      ? this.dataManager.getTodayCounts()
      : { words: 0, characters: 0, sentences: 0 };

    let varsIndex = 0;
    for (const i in expression.parsed) {
      const e = expression.parsed[i];
      newText = newText + e;
      switch (expression.vars[varsIndex]) {
        case 0:
          newText = newText + getWordCount("");
          break;
        case 1:
          newText = newText + getCharacterCount("");
          break;
        case 2:
          newText = newText + getSentenceCount("");
          break;
        case 3:
          newText = newText + (await this.dataCollector.getTotalWordCount());
          break;
        case 4:
          newText =
            newText + (await this.dataCollector.getTotalCharacterCount());
          break;
        case 5:
          newText =
            newText + (await this.dataCollector.getTotalSentenceCount());
          break;
        case 6:
          newText = newText + this.dataCollector.getTotalFileCount();
          break;
        case 7:
          newText = newText + todayCounts.words;
          break;
        case 8:
          newText = newText + todayCounts.characters;
          break;
        case 9:
          newText = newText + todayCounts.sentences;
          break;
      }
      varsIndex++;
    }

    this.statusBar.displayText(newText);
  }

  cursorActivity(cm: CodeMirror.Editor) {
    console.log("detected cursor activity");
    if (cm.somethingSelected()) {
      if (this.settings.countComments) {
        this.deboucer(cleanComments(cm.getSelection()));
      } else {
        this.deboucer(cm.getSelection());
      }
    } else {
      if (this.settings.collectStats) {
        this.dataManager.updateFromFile();
      }
      if (this.settings.countComments) {
        this.deboucer(cleanComments(cm.getValue()));
      } else {
        this.deboucer(cm.getValue());
      }
    }
  }
}
