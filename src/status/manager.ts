import type { Vault } from "obsidian";
import { DataCollector } from "src/data/collector";
import type { BetterWordCountSettings } from "src/settings/settings";
import {
  getWordCount,
  getCharacterCount,
  getSentenceCount,
} from "../data/stats";
import type { StatusBar } from "./bar";
import { Expression, parse } from "./parse";

export class BarManager {
  private statusBar: StatusBar;
  private settings: BetterWordCountSettings;
  private dataCollector: DataCollector;

  constructor(
    statusBar: StatusBar,
    settings: BetterWordCountSettings,
    vault: Vault
  ) {
    this.statusBar = statusBar;
    this.settings = settings;
    this.dataCollector = new DataCollector(vault);
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
          newText = newText + this.dataCollector.getTotalWordCount();
          break;
        case 4:
          newText = newText + this.dataCollector.getTotalCharacterCount();
          break;
        case 5:
          newText = newText + this.dataCollector.getTotalSentenceCount();
          break;
        case 6:
          newText = newText + this.dataCollector.getTotalFileCount();
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
    expression.parsed.forEach(async (value: string) => {
      newText = newText + value;
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
          newText = newText + (await this.dataCollector.getTotalFileCount());
          break;
      }
      varsIndex++;
    });

    this.statusBar.displayText(newText);
  }

  cursorActivity(cm: CodeMirror.Editor) {
    if (cm.somethingSelected()) {
      this.updateStatusBar(cm.getSelection());
    } else {
      this.updateStatusBar(cm.getValue());
    }
  }

  // change(cm: CodeMirror.Editor, changeObj: CodeMirror.EditorChangeLinkedList) {
  //   this.updateStatusBar(cm.getValue());
  // }
}
