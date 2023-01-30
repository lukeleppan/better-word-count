import { Transaction } from "@codemirror/state";
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

    if (!tr) {
      return;
    }

    // When selecting text with Shift+Home the userEventType is undefined.
    // This is probably a bug in codemirror, for the time being doing an explict check
    // for the type allows us to update the stats for the selection.
    const userEventTypeUndefined =
      tr.annotation(Transaction.userEvent) === undefined;

    if (
      (tr.isUserEvent("select") || userEventTypeUndefined) &&
      tr.newSelection.ranges[0].from !== tr.newSelection.ranges[0].to
    ) {
      let text = "";
      const selection = tr.newSelection.main;
      const textIter = tr.newDoc.iterRange(selection.from, selection.to);
      while (!textIter.done) {
        text = text + textIter.next().value;
      }
      this.plugin.statusBar.debounceStatusBarUpdate(text);
    } else if (
      tr.isUserEvent("input") ||
      tr.isUserEvent("delete") ||
      tr.isUserEvent("move") ||
      tr.isUserEvent("undo") ||
      tr.isUserEvent("redo") ||
      tr.isUserEvent("select")
    ) {
      console.log("OTHER EVENTS");
      const textIter = tr.newDoc.iter();
      let text = "";
      while (!textIter.done) {
        text = text + textIter.next().value;
      }
      if (tr.docChanged && this.plugin.statsManager) {
        this.plugin.statsManager.debounceChange(text);
      }
      this.plugin.statusBar.debounceStatusBarUpdate(text);
    }
  }

  addPlugin(plugin: BetterWordCount) {
    this.plugin = plugin;
    this.hasPlugin = true;
  }

  destroy() {}
}

export const editorPlugin = ViewPlugin.fromClass(EditorPlugin);
