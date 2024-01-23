import "obsidian";
import type BetterWordCountApi from "./api";

declare module "obsidian" {
  interface App {
    plugins: {
      enabledPlugins: Set<string>;
      plugins: {
        ["better-word-count"]?: {
          api: BetterWordCountApi;
        };
      };
    };
  }
}
