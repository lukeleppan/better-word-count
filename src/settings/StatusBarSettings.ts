import StatusBarSettings from "./StatusBarSettings.svelte";
import type BetterWordCount from "../main";

export function addStatusBarSettings(
  plugin: BetterWordCount,
  containerEl: HTMLElement
) {
  const statusItemsEl = containerEl.createEl("div");

  new StatusBarSettings({
    target: statusItemsEl,
    props: { plugin },
  });
}
