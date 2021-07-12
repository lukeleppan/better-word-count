export const DEFAULT_SETTINGS: BetterWordCountSettings = {
  preset: {
    name: "default",
    statusBarQuery: "{word_count} words {character_count} characters",
    statusBarAltQuery:
      "{file_count} files {total_word_count} words {total_character_count} characters",
  },
  statusBarQuery: "{word_count} words {character_count} characters",
  statusBarAltQuery:
    "{file_count} files {total_word_count} words {total_character_count} characters",
  countComments: false,
  collectStats: false,
};

export const PRESETS: PresetOption[] = [
  {
    name: "default",
    statusBarQuery: "{word_count} words {character_count} characters",
    statusBarAltQuery:
      "{file_count} files {total_word_count} words {total_character_count} characters",
  },
  {
    name: "minimal",
    statusBarQuery: "w: {word_count} c: {character_count}",
    statusBarAltQuery:
      "f: {file_count} tw: {total_word_count} tc: {total_character_count}",
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
