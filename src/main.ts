import { Plugin, TFile, WorkspaceLeaf } from "obsidian";
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
  public settings: BetterWordCountSettings = DEFAULT_SETTINGS;
  public statusBar: StatusBar = new StatusBar(this.addStatusBarItem(), this);
  public statsManager: StatsManager | null = null;

  async onunload(): Promise<void> {
    this.statsManager = null;
    this.statusBar = null;
  }

  async onload() {
    // Handle Settings
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
    this.addSettingTab(new BetterWordCountSettingsTab(this.app, this));

    // Handle Statistics
    if (this.settings.collectStats) {
      this.statsManager = new StatsManager(this.app.vault, this.app.workspace);
    }

    // Handle the Editor Plugin
    this.registerEditorExtension(editorPlugin);

    this.app.workspace.onLayoutReady(() => {
      this.giveEditorPlugin(this.app.workspace.getMostRecentLeaf());
    });

    this.registerEvent(
      this.app.workspace.on(
        "active-leaf-change",
        async (leaf: WorkspaceLeaf) => {
          this.giveEditorPlugin(leaf);
          if (leaf.view.getViewType() !== "markdown") {
            this.statusBar.updateAltBar();
          }

          if (!this.settings.collectStats) return;
          await this.statsManager.recalcTotals();
        }
      )
    );

    this.registerEvent(
      this.app.vault.on("delete", async () => {
        if (!this.settings.collectStats) return;
        await this.statsManager.recalcTotals();
      })
    );
  }

  giveEditorPlugin(leaf: WorkspaceLeaf): void {
    //@ts-expect-error, not typed
    const editor = leaf.view.editor;
    if (editor) {
      const editorView = editor.cm as EditorView;
      const editorPlug = editorView.plugin(editorPlugin);
      editorPlug.addPlugin(this);
      //@ts-expect-error, not typed
      const data: string = leaf.view.data;
      this.statusBar.updateStatusBar(data);
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
