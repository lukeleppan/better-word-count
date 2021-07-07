import moment from "moment";
import type { MetadataCache, TFile, Vault } from "obsidian";
import { getCharacterCount, getWordCount } from "./stats";

export class DataCollector {
  private vault: Vault;
  private metadataCache: MetadataCache;

  constructor(vault: Vault, metadataCache: MetadataCache) {
    this.vault = vault;
    this.metadataCache = metadataCache;
  }

  getTotalFileCount() {
    return Object.keys(this.metadataCache.resolvedLinks).length;
  }

  async getTotalWordCount() {
    let words = 0;
    const files = this.vault.getFiles();
    for (const i in files) {
      const file = files[i];
      words += getWordCount(await this.vault.cachedRead(file));
    }

    return words;
  }

  async getTotalCharacterCount() {
    let characters = 0;
    const files = this.vault.getFiles();
    for (const i in files) {
      const file = files[i];
      characters += getCharacterCount(await this.vault.cachedRead(file));
    }

    return characters;
  }

  async getTotalSentenceCount() {
    let sentence = 0;
    const files = this.vault.getFiles();
    for (const i in files) {
      const file = files[i];
      sentence += getCharacterCount(await this.vault.cachedRead(file));
    }

    return sentence;
  }
}
