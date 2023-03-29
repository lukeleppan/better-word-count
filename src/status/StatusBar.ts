import { MetricCounter, MetricType } from "src/settings/Settings";
import type BetterWordCount from "../main";
import {
  getWordCount,
  getCharacterCount,
  getSentenceCount,
  getCitationCount,
  getFootnoteCount,
  getPageCount,
} from "src/utils/StatUtils";
import { debounce } from "obsidian";

export default class StatusBar {
  private statusBarEl: HTMLElement;
  private plugin: BetterWordCount;
  public debounceStatusBarUpdate;

  constructor(statusBarEl: HTMLElement, plugin: BetterWordCount) {
    this.statusBarEl = statusBarEl;
    this.plugin = plugin;
    this.debounceStatusBarUpdate = debounce(
      (text: string) => this.updateStatusBar(text),
      20,
      false
    );

    this.statusBarEl.classList.add("mod-clickable");
    this.statusBarEl.setAttribute("aria-label", "Coming Soon");
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

  async updateStatusBar(text: string) {
    const sb = this.plugin.settings.statusBar;
    let display = "";

    for (let i = 0; i < sb.length; i++) {
      const sbItem = sb[i];

      display = display + sbItem.prefix;
      const metric = sbItem.metric;

      if (metric.counter === MetricCounter.words) {
        switch (metric.type) {
          case MetricType.file:
            display = display + getWordCount(text);
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailyWords()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalWords()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.characters) {
        switch (metric.type) {
          case MetricType.file:
            display = display + getCharacterCount(text);
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailyCharacters()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalCharacters()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.sentences) {
        switch (metric.type) {
          case MetricType.file:
            display = display + getSentenceCount(text);
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailySentences()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalSentences()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.footnotes) {
        switch (metric.type) {
          case MetricType.file:
            display = display + getFootnoteCount(text);
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailyFootnotes()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalFootnotes()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.citations) {
        switch (metric.type) {
          case MetricType.file:
            display = display + getCitationCount(text);
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailyCitations()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalCitations()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.pages) {
        switch (metric.type) {
          case MetricType.file:
            display = display + getPageCount(text, this.plugin.settings.pageWords);
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailyPages()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalPages()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.files) {
        switch (metric.type) {
          case MetricType.file:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalFiles()
                : 0);
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalFiles()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalFiles()
                : 0);
            break;
        }
      }

      display = display + sbItem.suffix;
    }

    this.displayText(display);
  }

  async updateAltBar() {
    const ab = this.plugin.settings.altBar;
    let display = "";

    for (let i = 0; i < ab.length; i++) {
      const sbItem = ab[i];

      display = display + sbItem.prefix;
      const metric = sbItem.metric;

      if (metric.counter === MetricCounter.words) {
        switch (metric.type) {
          case MetricType.file:
            display = display + 0;
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailyWords()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalWords()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.characters) {
        switch (metric.type) {
          case MetricType.file:
            display = display + 0;
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailyCharacters()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalCharacters()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.sentences) {
        switch (metric.type) {
          case MetricType.file:
            display = display + 0;
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailySentences()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalSentences()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.footnotes) {
      switch (metric.type) {
          case MetricType.file:
            display = display + 0;
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
              ? this.plugin.statsManager.getDailyFootnotes()
                   : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
              ? this.plugin.statsManager.getTotalFootnotes()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.citations) {
        switch (metric.type) {
          case MetricType.file:
            display = display + 0;
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailyCitations()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalCitations()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.pages) {
        switch (metric.type) {
          case MetricType.file:
            display = display + 0;
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getDailyPages()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (await (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalPages()
                : 0));
            break;
        }
      } else if (metric.counter === MetricCounter.files) {
        switch (metric.type) {
          case MetricType.file:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalFiles()
                : 0);
            break;
          case MetricType.daily:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalFiles()
                : 0);
            break;
          case MetricType.total:
            display =
              display +
              (this.plugin.settings.collectStats
                ? this.plugin.statsManager.getTotalFiles()
                : 0);
            break;
        }
      }

      display = display + sbItem.suffix;
    }

    this.displayText(display);
  }
}
