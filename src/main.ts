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
import { handleFileMenu } from "./utils/FileMenu";

export default class BetterWordCount extends Plugin {
  public settings: BetterWordCountSettings;

  protected statusBars = new WeakMap<Window,StatusBar>();

  public get statusBar(): StatusBar {
    const win = activeWindow;
    if (this.statusBars.has(win)) return this.statusBars.get(win);
    const cls = "plugin-" + this.manifest.id.toLowerCase().replace(/[^_a-zA-Z0-9-]/, "-");
    const container = win.document.querySelector("body > .app-container");
    const statusBar = container.find(".status-bar") || container.createDiv("status-bar");
    const statusBarEl = statusBar.find(".status-bar-item."+cls) ||
        statusBar.createDiv(`status-bar-item ${cls.replace(/\./g,' ')}`);
    const sb = new StatusBar(statusBarEl as HTMLElement, this);
    sb.register(() => {
      statusBarEl.detach();
      if (win !== window) setTimeout(
          () => {
            if (!statusBar.hasChildNodes()) statusBar.detach();
          }, 500   // allow for other unload operations to finish
      )
    });
    this.addChild(sb);
    this.statusBars.set(win, sb);
    return sb;
  };

  public statsManager: StatsManager;
  public api: BetterWordCountApi = new BetterWordCountApi(this);

  async onunload(): Promise<void> {
    this.statsManager = null;
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

    // Register a new action for right clicking on folders
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file, source) => {
        handleFileMenu(menu, file, source, this);
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
