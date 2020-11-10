import { MarkdownView, Plugin, TFile } from "obsidian";
import { StatusBar } from "./status-bar";

export default class BetterWordCount extends Plugin {
  public recentlyTyped: boolean;
  public statusBar: StatusBar;

  onload() {
    let statusBarEl = this.addStatusBarItem();
    this.statusBar = new StatusBar(statusBarEl);

    this.recentlyTyped = false;

    this.registerEvent(
      this.app.workspace.on("file-open", this.onFileOpen, this)
    );

    this.registerEvent(
      this.app.workspace.on("quick-preview", this.onQuickPreview, this)
    );

    this.registerInterval(
      window.setInterval(async () => {
        let activeLeaf = this.app.workspace.activeLeaf;
        let files: TFile[] = this.app.vault.getMarkdownFiles();
        let currentFile: TFile;

        files.forEach((file) => {
          if ((file.basename = activeLeaf.getDisplayText())) {
            currentFile = file;
          }
        });
        if (!activeLeaf || !(activeLeaf.view instanceof MarkdownView)) {
          return;
        }

        let editor = activeLeaf.view.sourceMode.cmEditor;
        if (editor.somethingSelected()) {
          let content: string = editor.getSelection();
          this.updateWordCount(content);
          this.recentlyTyped = false;
        } else if (
          currentFile &&
          currentFile.extension === "md" &&
          !this.recentlyTyped
        ) {
          const contents = await this.app.vault.read(currentFile);
          this.updateWordCount(contents);
        } else if (!this.recentlyTyped) {
          this.updateWordCount("");
        }
      }, 500)
    );

    let activeLeaf = this.app.workspace.activeLeaf;
    let files: TFile[] = this.app.vault.getMarkdownFiles();

    files.forEach((file) => {
      if ((file.basename = activeLeaf.getDisplayText())) {
        this.onFileOpen(file);
      }
    });
  }

  async onFileOpen(file: TFile) {
    if (file && file.extension === "md") {
      const contents = await this.app.vault.cachedRead(file);
      this.recentlyTyped = true;
      this.updateWordCount(contents);
    } else {
      this.updateWordCount("");
    }
  }

  onQuickPreview(file: TFile, contents: string) {
    const leaf = this.app.workspace.activeLeaf;
    if (leaf && leaf.view.getViewType() === "markdown") {
      this.recentlyTyped = true;
      this.updateWordCount(contents);
    }
  }

  updateWordCount(text: string) {
    let words = 0;

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

    this.statusBar.displayText(`${words} words ` + `${text.length} characters`);
  }
}
