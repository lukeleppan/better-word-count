import { Plugin } from "obsidian";
import BetterWordCountSettingsTab from "./settings/SettingsTab";
import StatsManager from "./stats/StatsManager";
import StatusBar from "./status/StatusBar";
import type { EditorView } from "@codemirror/view";
import { editorPlugin } from "./editor/EditorPlugin";
import {
  BetterWordCountSettings,
  DEFAULT_SETTINGS,
} from "src/settings/Settings";

export default class BetterWordCount extends Plugin {
  public settings: BetterWordCountSettings;
  public statusBar: StatusBar;
  public statsManager: StatsManager;

  // onunload(): void {
  //   this.app.workspace
  //     .getLeavesOfType(VIEW_TYPE_STATS)
  //     .forEach((leaf) => leaf.detach());
  // }

  async onload() {
    // Handle Settings
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new BetterWordCountSettingsTab(this.app, this));

    // Handle Statistics
    if (this.settings.collectStats) {
      this.statsManager = new StatsManager(this.app.vault, this.app.workspace);
    }

    // Handle Status Bar
    let statusBarEl = this.addStatusBarItem();
    this.statusBar = new StatusBar(statusBarEl, this);

    // Handle the Editor Plugin
    this.registerEditorExtension(editorPlugin);

    this.app.workspace.onLayoutReady(() => {
      //@ts-expect-error, not typed
      const editorView = this.app.workspace.getMostRecentLeaf().view.editor
        .cm as EditorView;
      const editorPlug = editorView.plugin(editorPlugin);
      editorPlug.addPlugin(this);
    });
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
