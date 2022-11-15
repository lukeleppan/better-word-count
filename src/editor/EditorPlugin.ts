import {
  ViewUpdate,
  PluginValue,
  EditorView,
  ViewPlugin,
} from "@codemirror/view";
import type BetterWordCount from "src/main";

class EditorPlugin implements PluginValue {
  hasPlugin: boolean;
  view: EditorView;
  private plugin: BetterWordCount;

  constructor(view: EditorView) {
    this.view = view;
    this.hasPlugin = false;
  }

  update(update: ViewUpdate): void {
    if (!this.hasPlugin) {
      return;
    }

    const tr = update.transactions[0];
    if (!tr) return;
    if (
      tr.isUserEvent("select") &&
      tr.newSelection.ranges[0].from !== tr.newSelection.ranges[0].to
    ) {
      let text = "";
      const selection = tr.newSelection.main;
      const textIter = tr.newDoc.iterRange(selection.from, selection.to);
      while (!textIter.done) {
        text = text + textIter.next().value;
      }
      this.plugin.statusBar.updateStatusBar(text);
    } else if (
      tr.isUserEvent("input") ||
      tr.isUserEvent("delete") ||
      tr.isUserEvent("move") ||
      tr.isUserEvent("undo") ||
      tr.isUserEvent("redo") ||
      tr.isUserEvent("select")
    ) {
      const textIter = tr.newDoc.iter();
      let text = "";
      while (!textIter.done) {
        text = text + textIter.next().value;
      }
      if (tr.docChanged && this.plugin.statsManager) {
        this.plugin.statsManager.change(text);
      }
      this.plugin.statusBar.updateStatusBar(text);
    }
  }

  addPlugin(plugin: BetterWordCount) {
    this.plugin = plugin;
    this.hasPlugin = true;
  }

  destroy() {}
}

export const editorPlugin = ViewPlugin.fromClass(EditorPlugin);
