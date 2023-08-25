import { MarkdownView, Plugin, WorkspaceLeaf } from "obsidian";
import BetterWordCountSettingsTab from "./settings/SettingsTab";
import StatsManager from "./stats/StatsManager";
import StatusBar from "./status/StatusBar";
import type { EditorView } from "@codemirror/view";
import {
  settingsChanged,
  pluginField,
  sectionWordCountEditorPlugin,
  statusBarEditorPlugin,
} from "./editor/EditorPlugin";
import { BetterWordCountSettings, DEFAULT_SETTINGS } from "src/settings/Settings";
import { settingsStore } from "./utils/SvelteStores";
import BetterWordCountApi from "src/api/api";

export default class BetterWordCount extends Plugin {
  public settings: BetterWordCountSettings;
  public statusBar: StatusBar;
  public statsManager: StatsManager;
  public api: BetterWordCountApi = new BetterWordCountApi(this);

  async onunload(): Promise<void> {
    this.statsManager = null;
    this.statusBar = null;
  }

  async onload() {
    // Settings Store
    // this.register(
    //   settingsStore.subscribe((value) => {
    //     this.settings = value;
    //   })
    // );
    // Handle Settings
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new BetterWordCountSettingsTab(this.app, this));

    // Handle Statistics
    if (this.settings.collectStats) {
      this.statsManager = new StatsManager(this.app.vault, this.app.workspace, this);
    }

    // Handle Status Bar
    let statusBarEl = this.addStatusBarItem();
    this.statusBar = new StatusBar(statusBarEl, this);

    // Handle the Editor Plugins
    this.registerEditorExtension([pluginField.init(() => this), statusBarEditorPlugin, sectionWordCountEditorPlugin]);

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", async (leaf: WorkspaceLeaf) => {
        if (leaf.view.getViewType() !== "markdown") {
          this.statusBar.updateAltBar();
        }

        if (!this.settings.collectStats) return;
        await this.statsManager.recalcTotals();
      })
    );

    this.registerEvent(
      this.app.vault.on("delete", async () => {
        if (!this.settings.collectStats) return;
        await this.statsManager.recalcTotals();
      })
    );
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  onDisplaySectionCountsChange() {
    this.app.workspace.getLeavesOfType("markdown").forEach((leaf) => {
      if (leaf?.view instanceof MarkdownView) {
        const cm = (leaf.view.editor as any).cm as EditorView;
        if (cm.dispatch) {
          cm.dispatch({
            effects: [settingsChanged.of()],
          });
        }
      }
    });
  }
}
