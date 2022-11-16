import {
  BetterWordCountSettings,
  DEFAULT_SETTINGS,
} from "src/settings/Settings";
import { writable } from "svelte/store";

export const settingsStore =
  writable<BetterWordCountSettings>(DEFAULT_SETTINGS);
