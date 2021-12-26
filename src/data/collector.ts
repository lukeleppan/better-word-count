import moment from "moment";
import type { MetadataCache, TFile, Vault } from "obsidian";
import type { BetterWordCountSettings } from "src/settings/settings";
import { getCharacterCount, getSentenceCount, getWordCount } from "./stats";

export class DataCollector {
  private vault: Vault;
  private metadataCache: MetadataCache;
  private settings: BetterWordCountSettings;

  constructor(vault: Vault, metadataCache: MetadataCache, settings: BetterWordCountSettings) {
    this.vault = vault;
    this.metadataCache = metadataCache;
    this.settings = settings;
  }

  getTotalFileCount() {
    return this.vault.getMarkdownFiles().length;
  }

  fileFiltered(fileName: string){
    return this.settings.fileNameFilter.length > 0 && fileName.includes(this.settings.fileNameFilter);
  }

  async getTotalWordCount() {
    let words = 0;
    const files = this.vault.getMarkdownFiles();
    for (const file of files) {
      if (!this.fileFiltered(file.basename)) {
        words += getWordCount(await this.vault.cachedRead(file));
      }
    }

    return words;
  }

  async getTotalCharacterCount() {
    let characters = 0;
    const files = this.vault.getMarkdownFiles();
    for (const file of files) {
      if (!this.fileFiltered(file.basename)) {
        characters += getCharacterCount(await this.vault.cachedRead(file));
      }
    }

    return characters;
  }

  async getTotalSentenceCount() {
    let sentences = 0;
    const files = this.vault.getMarkdownFiles();
    for (const file of files) {
      if (!this.fileFiltered(file.basename)) {
        sentences += getSentenceCount(await this.vault.cachedRead(file));
      }
    }

    return sentences;
  }
}
