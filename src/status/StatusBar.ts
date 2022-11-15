import { Counter } from "src/settings/Settings";
import type BetterWordCount from "../main";
import {
  getWordCount,
  getCharacterCount,
  getSentenceCount,
} from "src/utils/StatUtils";

export default class StatusBar {
  private statusBarEl: HTMLElement;
  private plugin: BetterWordCount;

  constructor(statusBarEl: HTMLElement, plugin: BetterWordCount) {
    this.statusBarEl = statusBarEl;
    this.plugin = plugin;

    this.statusBarEl.classList.add("mod-clickable");
    this.statusBarEl.setAttribute("aria-label", "Open Stats View");
    this.statusBarEl.setAttribute("aria-label-position", "top");
    this.statusBarEl.addEventListener("click", (ev: MouseEvent) =>
      this.onClick(ev)
    );
  }

  onClick(ev: MouseEvent) {
    ev;
  }

  displayText(text: string) {
    this.statusBarEl.setText(text);
  }

  updateStatusBar(text: string) {
    const sb = this.plugin.settings.statusBar;
    let display = "";

    for (let i = 0; i < sb.length; i++) {
      const sbItem = sb[i];

      display = display + sbItem.prefix;
      switch (sbItem.count) {
        case Counter.fileWords:
          display = display + getWordCount(text);
          break;
        case Counter.fileChars:
          display = display + getCharacterCount(text);
          break;
        case Counter.fileSentences:
          display = display + getSentenceCount(text);
          break;
        case Counter.totalWords:
          display = display + this.plugin.statsManager.getTotalWords();
          break;
        case Counter.totalChars:
          display = display + this.plugin.statsManager.getTotalCharacters();
          break;
        case Counter.totalSentences:
          display = display + this.plugin.statsManager.getTotalSentences();
          break;
        case Counter.totalNotes:
          display = display + this.plugin.statsManager.getTotalFiles();
          break;

        default:
          break;
      }

      display = display + sbItem.suffix;
    }

    this.displayText(display);
  }
}
