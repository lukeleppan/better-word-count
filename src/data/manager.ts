import moment from "moment";
import { debounce, Debouncer, MetadataCache, TFile, Vault } from "obsidian";
import { STATS_FILE } from "src/constants";
import { DataCollector } from "./collector";
import { getCharacterCount, getSentenceCount, getWordCount } from "./stats";

type History = Record<string, Day>;

interface Day {
  files: number;
  modifiedFiles: ModFiles;
  words: number;
  characters: number;
  sentences: number;
  totalWords: number;
  totalCharacters: number;
  totalSentences: number;
}

type ModFiles = Record<string, FileStats>;

type FileStats = Record<number, Count>;

interface Count {
  initial: number;
  current: number;
}

export interface TodayCounts {
  words: number;
  characters: number;
  sentences: number;
}

export interface TotalCounts {
  words: number;
  characters: number;
  sentences: number;
}

export class DataManager {
  private vault: Vault;
  private metadataCache: MetadataCache;
  private history: History;
  private today: string;
  private collector: DataCollector;
  private todayCounts: TodayCounts;
  public debounceChange: Debouncer<[file: TFile, data: string]>;

  constructor(vault: Vault, metadataCache: MetadataCache) {
    this.vault = vault;
    this.metadataCache = metadataCache;
    this.collector = new DataCollector(vault, metadataCache);
    this.debounceChange = debounce(
      (file: TFile, data: string) => this.change(file, data),
      1000,
      false
    );

    this.vault.adapter.exists(".vault-stats").then(async (exists) => {
      if (!exists) {
        this.vault.adapter.write(".vault-stats", "{}");
      }

      this.history = Object.assign(
        JSON.parse(await this.vault.adapter.read(".vault-stats"))
      );

      this.updateToday();
      this.update();
    });
  }

  async update(): Promise<void> {
    this.vault.adapter.write(STATS_FILE, JSON.stringify(this.history));
  }

  async updateToday(): Promise<void> {
    const newDay: Day = {
      files: this.collector.getTotalFileCount(),
      modifiedFiles: {},
      words: 0,
      characters: 0,
      sentences: 0,
      totalWords: await this.collector.getTotalWordCount(),
      totalCharacters: await this.collector.getTotalCharacterCount(),
      totalSentences: await this.collector.getTotalSentenceCount(),
    };

    if (!this.history.hasOwnProperty(moment().format("YYYY-MM-DD"))) {
      this.history[moment().format("YYYY-MM-DD")] = newDay;
    }

    this.today = moment().format("YYYY-MM-DD");

    this.update();
  }

  async setTotalStats() {
    this.history[this.today].files = this.collector.getTotalFileCount();
    this.history[this.today].totalWords =
      await this.collector.getTotalWordCount();
    this.history[this.today].totalCharacters =
      await this.collector.getTotalCharacterCount();
    this.history[this.today].totalSentences =
      await this.collector.getTotalSentenceCount();
    this.update();
  }

  change(file: TFile, data: string) {
    const currentWords = getWordCount(data);
    const currentCharacters = getCharacterCount(data);
    const currentSentences = getSentenceCount(data);

    if (
      this.history.hasOwnProperty(this.today) &&
      this.today === moment().format("YYYY-MM-DD")
    ) {
      if (!this.history[this.today].modifiedFiles.hasOwnProperty(file.path)) {
        const newWordCount: Count = {
          initial: currentWords,
          current: currentWords,
        };
        const newCharacterCount: Count = {
          initial: currentCharacters,
          current: currentCharacters,
        };
        const newSentenceCount: Count = {
          initial: currentSentences,
          current: currentSentences,
        };
        const fileStats: FileStats = {
          0: newWordCount,
          1: newCharacterCount,
          2: newSentenceCount,
        };

        this.history[this.today].modifiedFiles[file.path] = fileStats;
      } else {
        this.history[this.today].modifiedFiles[file.path][0].current =
          currentWords;
        this.history[this.today].modifiedFiles[file.path][1].current =
          currentCharacters;
        this.history[this.today].modifiedFiles[file.path][2].current =
          currentSentences;
      }
      this.updateTodayCounts();
      this.update();
    } else {
      this.updateToday();
    }
  }

  updateTodayCounts() {
    const words = Object.values(this.history[this.today].modifiedFiles)
      .map((counts) => Math.max(0, counts[0].current - counts[0].initial))
      .reduce((a, b) => a + b, 0);
    const characters = Object.values(this.history[this.today].modifiedFiles)
      .map((counts) => Math.max(0, counts[1].current - counts[1].initial))
      .reduce((a, b) => a + b, 0);
    const sentences = Object.values(this.history[this.today].modifiedFiles)
      .map((counts) => Math.max(0, counts[2].current - counts[2].initial))
      .reduce((a, b) => a + b, 0);

    this.history[this.today].words = words;
    this.history[this.today].characters = characters;
    this.history[this.today].sentences = sentences;

    this.todayCounts = {
      words: words,
      characters: characters,
      sentences: sentences,
    };
  }

  getTodayCounts(): TodayCounts {
    return this.todayCounts;
  }

  getTotalCounts(): TotalCounts {
    return {
      words: this.history[this.today].totalWords,
      characters: this.history[this.today].totalCharacters,
      sentences: this.history[this.today].totalSentences,
    };
  }

  async updateFromFile() {
    this.history = Object.assign(
      JSON.parse(await this.vault.adapter.read(".vault-stats"))
    );
  }
}
