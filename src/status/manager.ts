import type { MetadataCache, Vault } from "obsidian";
import { DataCollector } from "src/data/collector";
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
  }

  async updateStatusBar(text: string): Promise<void> {
    let newText = "";
    const expression: Expression = parse(this.settings.statusBarQuery);

    let varsIndex = 0;
    expression.parsed.forEach((value: string) => {
      newText = newText + value;
      switch (expression.vars[varsIndex]) {
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
          newText = newText + 0;
          break;
        case 4:
          newText = newText + 0;
          break;
        case 5:
          newText = newText + 0;
          break;
        case 6:
          newText = newText + 0;
          break;
      }
      varsIndex++;
    });

    this.statusBar.displayText(newText);
  }

  async updateAltStatusBar(): Promise<void> {
    let newText = "";
    const expression: Expression = parse(this.settings.statusBarAltQuery);

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
            newText + (await this.dataCollector.getTotalCharacterCount());
          break;
        case 6:
          newText = newText + this.dataCollector.getTotalFileCount();
          break;
      }
      varsIndex++;
    }

    this.statusBar.displayText(newText);
  }

  cursorActivity(cm: CodeMirror.Editor) {
    if (cm.somethingSelected()) {
      if (this.settings.countComments) {
        this.updateStatusBar(cleanComments(cm.getSelection()));
      } else {
        this.updateStatusBar(cm.getSelection());
      }
    } else {
      if (this.settings.countComments) {
        this.updateStatusBar(cleanComments(cm.getValue()));
      } else {
        this.updateStatusBar(cm.getValue());
      }
    }
  }
}
