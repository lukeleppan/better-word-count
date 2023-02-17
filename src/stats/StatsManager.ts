import { debounce, Debouncer, TFile, Vault, Workspace } from "obsidian";
import { STATS_FILE } from "../constants";
import type { Day, VaultStatistics } from "./Stats";
import moment from "moment";
import {
  getCharacterCount,
  getSentenceCount,
  getWordCount,
  getCitationCount,
  getFootnoteCount,
} from "../utils/StatUtils";

export default class StatsManager {
  private vault: Vault;
  private workspace: Workspace;
  private vaultStats: VaultStatistics;
  private today: string;
  public debounceChange;

  constructor(vault: Vault, workspace: Workspace) {
    this.vault = vault;
    this.workspace = workspace;
    this.debounceChange = debounce(
      (text: string) => this.change(text),
      50,
      false
    );

    this.vault.on("rename", (new_name, old_path) => {
      if (this.vaultStats.modifiedFiles.hasOwnProperty(old_path)) {
        const content = this.vaultStats.modifiedFiles[old_path];
        delete this.vaultStats.modifiedFiles[old_path];
        this.vaultStats.modifiedFiles[new_name.path] = content;
      }
    });

    this.vault.on("delete", (deleted_file) => {
      if (this.vaultStats.modifiedFiles.hasOwnProperty(deleted_file.path)) {
        delete this.vaultStats.modifiedFiles[deleted_file.path];
      }
    });

    this.vault.adapter.exists(STATS_FILE).then(async (exists) => {
      if (!exists) {
        const vaultSt: VaultStatistics = {
          history: {},
          modifiedFiles: {},
        };
        await this.vault.adapter.write(STATS_FILE, JSON.stringify(vaultSt));
        this.vaultStats = JSON.parse(await this.vault.adapter.read(STATS_FILE));
      } else {
        this.vaultStats = JSON.parse(await this.vault.adapter.read(STATS_FILE));
        if (!this.vaultStats.hasOwnProperty("history")) {
          const vaultSt: VaultStatistics = {
            history: {},
            modifiedFiles: {},
          };
          await this.vault.adapter.write(STATS_FILE, JSON.stringify(vaultSt));
        }
        this.vaultStats = JSON.parse(await this.vault.adapter.read(STATS_FILE));
      }

      await this.updateToday();
    });
  }

  async update(): Promise<void> {
    this.vault.adapter.write(STATS_FILE, JSON.stringify(this.vaultStats));
  }

  async updateToday(): Promise<void> {
    if (this.vaultStats.history.hasOwnProperty(moment().format("YYYY-MM-DD"))) {
      this.today = moment().format("YYYY-MM-DD");
      return;
    }

    this.today = moment().format("YYYY-MM-DD");
    const totalWords = await this.calcTotalWords();
    const totalCharacters = await this.calcTotalCharacters();
    const totalSentences = await this.calcTotalSentences();
    const totalFootnotes = await this.calcTotalFootnotes();
    const totalCitations = await this.calcTotalCitations();

    const newDay: Day = {
      words: 0,
      characters: 0,
      sentences: 0,
      files: 0,
      footnotes: 0,
      citations: 0,
      totalWords: totalWords,
      totalCharacters: totalCharacters,
      totalSentences: totalSentences,
      totalFootnotes: totalFootnotes,
      totalCitations: totalCitations,
    };

    this.vaultStats.modifiedFiles = {};
    this.vaultStats.history[this.today] = newDay;
    await this.update();
  }

  public async change(text: string) {
    const fileName = this.workspace.getActiveFile().path;
    const currentWords = getWordCount(text);
    const currentCharacters = getCharacterCount(text);
    const currentSentences = getSentenceCount(text);
    const currentCitations = getCitationCount(text);
    const currentFootnotes = getFootnoteCount(text);
    if (
      this.vaultStats.history.hasOwnProperty(this.today) &&
      this.today === moment().format("YYYY-MM-DD")
    ) {
      let modFiles = this.vaultStats.modifiedFiles;

      if (modFiles.hasOwnProperty(fileName)) {
        this.vaultStats.history[this.today].totalWords +=
          currentWords - modFiles[fileName].words.current;
        this.vaultStats.history[this.today].totalCharacters +=
          currentCharacters - modFiles[fileName].characters.current;
        this.vaultStats.history[this.today].totalSentences +=
          currentSentences - modFiles[fileName].sentences.current;
        this.vaultStats.history[this.today].totalFootnotes +=
          currentSentences - modFiles[fileName].footnotes.current;
        this.vaultStats.history[this.today].totalCitations +=
          currentSentences - modFiles[fileName].citations.current;
        modFiles[fileName].words.current = currentWords;
        modFiles[fileName].characters.current = currentCharacters;
        modFiles[fileName].sentences.current = currentSentences;
        modFiles[fileName].footnotes.current = currentSentences;
        modFiles[fileName].citations.current = currentSentences;
      } else {
        modFiles[fileName] = {
          words: {
            initial: currentWords,
            current: currentWords,
          },
          characters: {
            initial: currentCharacters,
            current: currentCharacters,
          },
          sentences: {
            initial: currentSentences,
            current: currentSentences,
          },
          footnotes: {
            initial: currentFootnotes,
            current: currentFootnotes,
          },
          citations: {
            initial: currentCitations,
            current: currentCitations,
          },
        };
      }

      const words = Object.values(modFiles)
        .map((counts) =>
          Math.max(0, counts.words.current - counts.words.initial)
        )
        .reduce((a, b) => a + b, 0);
      const characters = Object.values(modFiles)
        .map((counts) =>
          Math.max(0, counts.characters.current - counts.characters.initial)
        )
        .reduce((a, b) => a + b, 0);
      const sentences = Object.values(modFiles)
        .map((counts) =>
          Math.max(0, counts.sentences.current - counts.sentences.initial)
        )
        .reduce((a, b) => a + b, 0);
      const footnotes = Object.values(modFiles)
        .map((counts) =>
          Math.max(0, counts.footnotes.current - counts.footnotes.initial)
        )
        .reduce((a, b) => a + b, 0);
      const citations = Object.values(modFiles)
        .map((counts) =>
          Math.max(0, counts.citations.current - counts.citations.initial)
        )
        .reduce((a, b) => a + b, 0);

      this.vaultStats.history[this.today].words = words;
      this.vaultStats.history[this.today].characters = characters;
      this.vaultStats.history[this.today].sentences = sentences;
      this.vaultStats.history[this.today].footnotes = footnotes;
      this.vaultStats.history[this.today].citations = citations;
      this.vaultStats.history[this.today].files = this.getTotalFiles();

      await this.update();
    } else {
      this.updateToday();
    }
  }

  public async recalcTotals() {
    if (!this.vaultStats) return;
    if (
      this.vaultStats.history.hasOwnProperty(this.today) &&
      this.today === moment().format("YYYY-MM-DD")
    ) {
      const todayHist: Day = this.vaultStats.history[this.today];
      todayHist.totalWords = await this.calcTotalWords();
      todayHist.totalCharacters = await this.calcTotalCharacters();
      todayHist.totalSentences = await this.calcTotalSentences();
      todayHist.totalFootnotes = await this.calcTotalFootnotes();
      todayHist.totalCitations = await this.calcTotalCitations();
      this.update();
    } else {
      this.updateToday();
    }
  }

  private async calcTotalWords(): Promise<number> {
    let words = 0;

    const files = this.vault.getFiles();
    for (const i in files) {
      const file = files[i];
      if (file.extension === "md") {
        words += getWordCount(await this.vault.cachedRead(file));
      }
    }

    return words;
  }

  private async calcTotalCharacters(): Promise<number> {
    let characters = 0;
    const files = this.vault.getFiles();
    for (const i in files) {
      const file = files[i];
      if (file.extension === "md") {
        characters += getCharacterCount(await this.vault.cachedRead(file));
      }
    }
    return characters;
  }

  private async calcTotalSentences(): Promise<number> {
    let sentence = 0;
    const files = this.vault.getFiles();
    for (const i in files) {
      const file = files[i];
      if (file.extension === "md") {
        sentence += getSentenceCount(await this.vault.cachedRead(file));
      }
    }
    return sentence;
  }

  private async calcTotalFootnotes(): Promise<number> {
    let footnotes = 0;
    const files = this.vault.getFiles();
    for (const i in files) {
      const file = files[i];
      if (file.extension === "md") {
        footnotes += getFootnoteCount(await this.vault.cachedRead(file));
      }
    }
    return footnotes;
  }

  private async calcTotalCitations(): Promise<number> {
    let citations = 0;
    const files = this.vault.getFiles();
    for (const i in files) {
      const file = files[i];
      if (file.extension === "md") {
        citations += getCitationCount(await this.vault.cachedRead(file));
      }
    }
    return citations;
  }

  public getDailyWords(): number {
    return this.vaultStats.history[this.today].words;
  }

  public getDailyCharacters(): number {
    return this.vaultStats.history[this.today].characters;
  }

  public getDailySentences(): number {
    return this.vaultStats.history[this.today].sentences;
  }

  public getDailyFootnotes(): number {
    return this.vaultStats.history[this.today].footnotes;
  }

  public getDailyCitations(): number {
    return this.vaultStats.history[this.today].citations;
  }

  public getTotalFiles(): number {
    return this.vault.getMarkdownFiles().length;
  }

  public async getTotalWords(): Promise<number> {
    if (!this.vaultStats) return await this.calcTotalWords();
    return this.vaultStats.history[this.today].totalWords;
  }

  public async getTotalCharacters(): Promise<number> {
    if (!this.vaultStats) return await this.calcTotalCharacters();
    return this.vaultStats.history[this.today].totalCharacters;
  }

  public async getTotalSentences(): Promise<number> {
    if (!this.vaultStats) return await this.calcTotalSentences();
    return this.vaultStats.history[this.today].totalSentences;
  }

  public async getTotalFootnotes(): Promise<number> {
    if (!this.vaultStats) return await this.calcTotalFootnotes();
    return this.vaultStats.history[this.today].totalFootnotes;
  }

  public async getTotalCitations(): Promise<number> {
    if (!this.vaultStats) return await this.calcTotalCitations();
    return this.vaultStats.history[this.today].totalCitations;
  }

}
