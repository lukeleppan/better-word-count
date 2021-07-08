import { Plugin, TFile, addIcon, WorkspaceLeaf } from "obsidian";
import { BetterWordCountSettingsTab } from "./settings/settings-tab";
import { BetterWordCountSettings, DEFAULT_SETTINGS } from "./settings/settings";
import { StatusBar } from "./status/bar";
import { STATS_ICON, STATS_ICON_NAME, VIEW_TYPE_STATS } from "./constants";
// import StatsView from "./view/view";
import { DataManager } from "./data/manager";
import { BarManager } from "./status/manager";
import type CodeMirror from "codemirror";

export default class BetterWordCount extends Plugin {
  public statusBar: StatusBar;
  public currentFile: TFile;
  public settings: BetterWordCountSettings;
  // public view: StatsView;
  public dataManager: DataManager;
  public barManager: BarManager;

  onunload(): void {
    this.app.workspace
      .getLeavesOfType(VIEW_TYPE_STATS)
      .forEach((leaf) => leaf.detach());
  }

  async onload() {
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new BetterWordCountSettingsTab(this.app, this));

    let statusBarEl = this.addStatusBarItem();
    this.statusBar = new StatusBar(statusBarEl);
    this.barManager = new BarManager(
      this.statusBar,
      this.settings,
      this.app.vault,
      this.app.metadataCache
    );

    if (this.settings.collectStats) {
      this.dataManager = new DataManager(
        this.app.vault,
        this.app.metadataCache
      );
    }

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", this.activeLeafChange, this)
    );

    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      cm.on("cursorActivity", (cm: CodeMirror.Editor) =>
        this.barManager.cursorActivity(cm)
      );
    });

    if (this.settings.collectStats) {
      this.registerEvent(
        this.app.workspace.on(
          "quick-preview",
          this.dataManager.change,
          this.dataManager
        )
      );

      this.registerInterval(
        window.setInterval(() => {
          this.dataManager.setTotalStats();
        }, 1000 * 60)
      );
    }

    // addIcon(STATS_ICON_NAME, STATS_ICON);

    // this.addCommand({
    //   id: "show-vault-stats-view",
    //   name: "Open Statistics",
    //   checkCallback: (checking: boolean) => {
    //     if (checking) {
    //       return this.app.workspace.getLeavesOfType("vault-stats").length === 0;
    //     }
    //     this.initLeaf();
    //   },
    // });

    // this.registerView(
    //   VIEW_TYPE_STATS,
    //   (leaf: WorkspaceLeaf) => (this.view = new StatsView(leaf))
    // );

    // if (this.app.workspace.layoutReady) {
    //   this.initLeaf();
    // } else {
    //   this.app.workspace.onLayoutReady(() => this.initLeaf());
    // }
  }

  activeLeafChange(leaf: WorkspaceLeaf) {
    if (!(leaf.view.getViewType() === "markdown")) {
      this.barManager.updateAltStatusBar();
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  // initLeaf(): void {
  //   if (this.app.workspace.getLeavesOfType(VIEW_TYPE_STATS).length) {
  //     return;
  //   }
  //   this.app.workspace.getRightLeaf(false).setViewState({
  //     type: VIEW_TYPE_STATS,
  //   });
  // }
}
