import { ItemView, WorkspaceLeaf } from "obsidian";
import { STATS_ICON_NAME, VIEW_TYPE_STATS } from "src/constants";
//@ts-ignore
import Statistics from "./Statistics.svelte";

export default class StatsView extends ItemView {
  private statistics: Statistics;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_STATS;
  }

  getDisplayText(): string {
    return "Statistics";
  }

  getIcon(): string {
    return STATS_ICON_NAME;
  }

  async onOpen(): Promise<void> {
    this.statistics = new Statistics({
      target: (this as any).contentEl,
    });
  }
}
