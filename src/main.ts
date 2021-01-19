import {
  MarkdownView,
  Plugin,
  TFile,
  MetadataCache,
  getAllTags,
} from "obsidian";
import { BetterWordCountSettingsTab } from "./settings/settings-tab";
import { BetterWordCountSettings } from "./settings/settings";
import { StatusBar } from "./status-bar";

export default class BetterWordCount extends Plugin {
  public recentlyTyped: boolean;
  public statusBar: StatusBar;
  public currentFile: TFile;
  public settings: BetterWordCountSettings;

  async onload() {
    let statusBarEl = this.addStatusBarItem();
    this.statusBar = new StatusBar(statusBarEl);

    this.updateAltCount();

    this.recentlyTyped = false;

    this.settings = (await this.loadData()) || new BetterWordCountSettings();
    this.addSettingTab(new BetterWordCountSettingsTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on("file-open", this.onFileOpen, this)
    );

    this.registerEvent(
      this.app.workspace.on("quick-preview", this.onQuickPreview, this)
    );

    this.registerInterval(
      window.setInterval(async () => {
        let activeLeaf = this.app.workspace.activeLeaf;

        if (!activeLeaf || !(activeLeaf.view instanceof MarkdownView)) {
          return;
        }

        let editor = activeLeaf.view.sourceMode.cmEditor;
        if (editor.somethingSelected()) {
          let content: string = editor.getSelection();
          this.updateWordCount(content);
          this.recentlyTyped = false;
        } else if (
          this.currentFile &&
          this.currentFile.extension === "md" &&
          !this.recentlyTyped
        ) {
          const contents = await this.app.vault.cachedRead(this.currentFile);
          this.updateWordCount(contents);
        } else if (!this.recentlyTyped) {
          this.updateWordCount("");
        }
      }, 500)
    );

    let activeLeaf = this.app.workspace.activeLeaf;
    let files: TFile[] = this.app.vault.getMarkdownFiles();

    files.forEach((file) => {
      if (file.basename === activeLeaf.getDisplayText()) {
        this.onFileOpen(file);
      }
    });
  }

  async onFileOpen(file: TFile) {
    this.currentFile = file;
    if (file && file.extension === "md") {
      const contents = await this.app.vault.cachedRead(file);
      this.recentlyTyped = true;
      this.updateWordCount(contents);
    } else {
      this.updateAltCount();
    }
  }

  onQuickPreview(file: TFile, contents: string) {
    this.currentFile = file;
    const leaf = this.app.workspace.activeLeaf;

    if (leaf && leaf.view.getViewType() === "markdown") {
      this.recentlyTyped = true;
      this.updateWordCount(contents);
    }
  }

  async updateAltCount() {
    // Thanks to Eleanor Konik for the alternate count idea.
    const files = this.app.vault.getFiles().length;

    this.statusBar.displayText(`${files} files`);
  }

  updateWordCount(text: string) {
    let words: number = 0;

    const matches = text.match(
      /[a-zA-Z0-9_\u0392-\u03c9\u00c0-\u00ff\u0600-\u06ff]+|[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/gm
    );

    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        if (matches[i].charCodeAt(0) > 19968) {
          words += matches[i].length;
        } else {
          words += 1;
        }
      }
    }

    // Thanks to Extract Highlights plugin and AngelusDomini
    // Also https://stackoverflow.com/questions/5553410
    const sentences: number = (
      (text || "").match(
        /[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm
      ) || []
    ).length;

    let displayText: string = "";
    if (this.settings.showWords) {
      displayText =
        displayText +
        this.settings.wordsPrefix +
        words +
        this.settings.wordsSuffix;
    }
    if (this.settings.showCharacters) {
      displayText =
        displayText +
        this.settings.charactersPrefix +
        text.length +
        this.settings.charactersSuffix;
    }
    if (this.settings.showSentences) {
      displayText =
        displayText +
        this.settings.sentencesPrefix +
        sentences +
        this.settings.sentencesSuffix;
    }

    this.statusBar.displayText(displayText);
  }
}
