import {
  MarkdownView,
  Plugin,
  TFile,
  MetadataCache,
  getAllTags,
} from "obsidian";
import { BetterWordCountSettingsTab } from "./settings/settings-tab";
import { BetterWordCountSettings } from "./settings/settings";
import {
  getWordCount,
  getCharacterCount,
  getSentenceCount,
  getFilesCount,
} from "./stats";
import { StatusBar } from "./status-bar";

export default class BetterWordCount extends Plugin {
  public recentlyTyped: boolean;
  public statusBar: StatusBar;
  public currentFile: TFile;
  public settings: BetterWordCountSettings;

  async onload() {
    let statusBarEl = this.addStatusBarItem();
    this.statusBar = new StatusBar(statusBarEl);

    this.recentlyTyped = false;

    this.settings = (await this.loadData()) || new BetterWordCountSettings();
    this.addSettingTab(new BetterWordCountSettingsTab(this.app, this));

    this.updateAltCount();

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
    const files = getFilesCount(this.app.vault.getFiles());

    let displayText: string = `${files} files `;
    let allWords = 0;
    let allCharacters = 0;
    let allSentences = 0;

    for(const f of this.app.vault.getMarkdownFiles()){
      let fileContents = await this.app.vault.cachedRead(f);
      allWords += getWordCount(fileContents);
      allCharacters += getCharacterCount(fileContents);
      allSentences += getSentenceCount(fileContents);
    }

    if (this.settings.showWords) {
      displayText =
        displayText +
        this.settings.wordsPrefix +
        allWords +
        this.settings.wordsSuffix;
    }
    if (this.settings.showCharacters) {
      displayText =
        displayText +
        this.settings.charactersPrefix +
        allCharacters +
        this.settings.charactersSuffix;
    }
    if (this.settings.showSentences) {
      displayText =
        displayText +
        this.settings.sentencesPrefix +
        allSentences +
        this.settings.sentencesSuffix;
    }

    this.statusBar.displayText(displayText);
  }

  updateWordCount(text: string) {
    let displayText: string = "";
    if (this.settings.showWords) {
      displayText =
        displayText +
        this.settings.wordsPrefix +
        getWordCount(text) +
        this.settings.wordsSuffix;
    }
    if (this.settings.showCharacters) {
      displayText =
        displayText +
        this.settings.charactersPrefix +
        getCharacterCount(text) +
        this.settings.charactersSuffix;
    }
    if (this.settings.showSentences) {
      displayText =
        displayText +
        this.settings.sentencesPrefix +
        getSentenceCount(text) +
        this.settings.sentencesSuffix;
    }

    this.statusBar.displayText(displayText);
  }
}
