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
    if (tr.isUserEvent("select")) {
      let text = "";
      const selection = tr.newSelection.main;
      const textIter = tr.newDoc.iterRange(selection.from, selection.to);
      while (!textIter.done) {
        text = text + textIter.next().value;
      }
    }
  }

  addPlugin(plugin: BetterWordCount) {
    this.plugin = plugin;
    this.hasPlugin = true;
  }

  destroy() {}
}

export const editorPlugin = ViewPlugin.fromClass(EditorPlugin);
