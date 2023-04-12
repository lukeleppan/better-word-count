import {Plugin, TAbstractFile, TFile, WorkspaceLeaf} from 'obsidian';
import BetterWordCountSettingsTab from './settings/settings-tab';
import {MetricsManager} from './metrics/';
import StatusBar from './status/status-bar';
import type {EditorView} from '@codemirror/view';
import {editorPlugin} from './editor/editor-plugin';
// import {BetterWordCountSettings, DEFAULT_SETTINGS} from 'src/settings/Settings';

/**
 * Main Plugin Class.
 *
 * @class BetterWordCount
 * @augments {Plugin}
 */
export default class BWCPlugin extends Plugin {
  public data: BWCData;
  public statusBar: StatusBar;
  public metricsManager: MetricsManager;

  /**
   * Called when the plugin is unloaded.
   */
  async onunload(): Promise<void> {
    this.metricsManager = null;
    this.statusBar = null;
  }

  /**
   * Called when the plugin is loaded.
   */
  async onload() {
    // // TODO - Fix Handle Settings
    // this.data = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new BetterWordCountSettingsTab(this.app, this));
    // Handle Statistics
    // this.metricsManager = new MetricsManager(this);
    // Handle Status Bar
    // this.statusBar = new StatusBar(this.addStatusBarItem(), this);
    // Handle the Editor Plugin
    // this.registerEditorExtension(editorPlugin);
    // this.app.workspace.onLayoutReady(() => {
    //   this.#giveEditorPlugin(this.app.workspace.getMostRecentLeaf());
    // });
    // this.registerEvent(
    //   this.app.workspace.on(
    //     'active-leaf-change',
    //     async (leaf: WorkspaceLeaf) => {
    //       this.#giveEditorPlugin(leaf);
    //       if (leaf.view.getViewType() !== 'markdown') {
    //         this.statusBar.updateAltBar();
    //       }
    //
    //       if (!this.settings.collectStats) return;
    //       await this.statsManager.recalcTotals();
    //     }
    //   )
    // );
    //
    // this.registerEvent(
    //   this.app.vault.on('delete', (file: TAbstractFile) => {
    //     console.log('delete');
    //     console.log(file);
    //   })
    // );
    //
    // this.registerEvent(
    //   this.app.vault.on('rename', (file: TAbstractFile, oldPath: string) => {
    //     this.statsManager.handleRename(file, oldPath);
    //   })
    // );
    //
    //   this.registerEvent(
    //     this.app.vault.on('modify', (file: TFile) => {
    //       console.log('modify');
    //       console.log(file);
    //     })
    //   );
  }

  getData(): BWCData {
    return this.data;
  }

  getSettings(): BWCSettings {
    return this.data.settings;
  }

  getModifiedFiles(): ModifiedFiles {
    return this.data.modifiedFiles;
  }

  setSettings(settings: BWCSettings): void {
    this.data.settings = settings;
    this.saveData(this.data);
  }

  setModifiedFiles(modifiedFiles: ModifiedFiles): void {
    this.data.modifiedFiles = modifiedFiles;
    this.saveData(this.data);
  }

  properSaveData(newData: BWCData): void {
    this.data = newData;
    this.saveData(this.data);
  }

  /**
   * Called when a file is opened.
   *
   * @param {WorkspaceLeaf} leaf - The leaf that was opened.
   */
  #giveEditorPlugin(leaf: WorkspaceLeaf): void {
    // @ts-expect-error, not typed
    const editor = leaf?.view?.editor;
    if (editor) {
      const editorView = editor.cm as EditorView;
      const editorPlug = editorView.plugin(editorPlugin);
      editorPlug.addPlugin(this);
      // @ts-expect-error, not typed
      const data: string = leaf.view.data;
      this.statusBar.updateStatusBar(data);
    }
  }
}
