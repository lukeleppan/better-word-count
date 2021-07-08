export const DEFAULT_SETTINGS: BetterWordCountSettings = {
  preset: {
    name: "default",
    statusBarQuery: "{word_count} words {character_count} characters",
    statusBarAltQuery:
      "{files} files {total_words} words {total_characters} characters",
  },
  statusBarQuery: "{word_count} words {character_count} characters",
  statusBarAltQuery:
    "{files} files {total_words} words {total_characters} characters",
  countComments: false,
  collectStats: false,
};

export const PRESETS: PresetOption[] = [
  {
    name: "default",
    statusBarQuery: "{word_count} words {character_count} characters",
    statusBarAltQuery:
      "{files} files {total_words} words {total_characters} characters",
  },
  {
    name: "minimal",
    statusBarQuery: "w: {word_count} c: {character_count}",
    statusBarAltQuery: "f: {files} tw: {total_words} tc: {total_characters}",
  },
  {
    name: "custom",
    statusBarQuery: "",
    statusBarAltQuery: "",
  },
];

export interface BetterWordCountSettings {
  preset: PresetOption;
  statusBarQuery: string;
  statusBarAltQuery: string;
  countComments: boolean;
  collectStats: boolean;
}

export interface PresetOption {
  name: string;
  statusBarQuery: string;
  statusBarAltQuery: string;
}
