import { TFile, normalizePath } from "obsidian";
import type BetterWordCount from "src/main";
import { getCharacterCount, getCitationCount, getFootnoteCount, getPageCount, getSentenceCount, getWordCount } from "src/utils/StatUtils";

export default class BetterWordCountApi {
  private plugin: BetterWordCount;

  constructor(plugin: BetterWordCount) {
    this.plugin = plugin;
  }

  // plain utility functions
  public getWordCount(text: string): number {
    return getWordCount(text);
  }
  public getCharacterCount(text: string): number {
    return getCharacterCount(text);
  }
  public getFootnoteCount(text: string): number {
    return getFootnoteCount(text);
  }
  public getCitationCount(text: string): number {
    return getCitationCount(text);
  }
  public getSentenceCount(text: string): number {
    return getSentenceCount(text);
  }
  public getPageCount(text: string, pageWords: number = this.plugin.settings.pageWords): number {
    return getPageCount(text, pageWords);
  }

  // Functions using page paths e.g. for use with dataviewjs
  private async countPagePath(path: string, countFunc: (text: string) => number): Promise<number | null> {
    const normalizedPath = normalizePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    // Check if it exists and is of the correct type
    if (file instanceof TFile) {
      const text = await this.plugin.app.vault.cachedRead(file);
      return countFunc(text);
    }

    return null;
  }

  public async getWordCountPagePath(path: string): Promise<number | null> {
    return this.countPagePath(path, getWordCount);
  }
  public getCharacterCountPagePath(path: string): Promise<number | null> {
    return this.countPagePath(path, getCharacterCount);
  }
  public getFootnoteCountPagePath(path: string): Promise<number | null> {
    return this.countPagePath(path, getFootnoteCount);
  }
  public getCitationCountPagePath(path: string): Promise<number | null> {
    return this.countPagePath(path, getCitationCount);
  }
  public getSentenceCountPagePath(path: string): Promise<number | null> {
    return this.countPagePath(path, getSentenceCount);
  }
  public getPageCountPagePath(path: string, pageWords: number = this.plugin.settings.pageWords): Promise<number | null> {
    return this.countPagePath(path, (text: string) => getPageCount(text, pageWords));
  }

  // Functions for accessing stats
  public getDailyWords(): number | null {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getDailyWords();
  }

  public getDailyCharacters(): number | null {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getDailyCharacters();
  }

  public getDailySentences(): number | null {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getDailySentences();
  }

  public getDailyFootnotes(): number | null {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getDailyFootnotes();
  }

  public getDailyCitations(): number | null {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getDailyCitations();
  }

  public getDailyPages(): number | null {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getDailyPages();
  }

  public getTotalFiles(): number | null {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getTotalFiles();
  }

  public async getTotalWords(): Promise<number | null> {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getTotalWords();
  }

  public async getTotalCharacters(): Promise<number | null> {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getTotalCharacters();
  }

  public async getTotalSentences(): Promise<number | null> {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getTotalSentences();
  }

  public async getTotalFootnotes(): Promise<number | null> {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getTotalFootnotes();
  }

  public async getTotalCitations(): Promise<number | null> {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getTotalCitations();
  }

  public async getTotalPages(): Promise<number | null> {
    if (!this.plugin.statsManager) return null;
    return this.plugin.statsManager.getTotalPages();
  }
}
