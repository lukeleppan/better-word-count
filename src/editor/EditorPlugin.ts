import { Line, RangeSetBuilder, StateEffect, StateField, Text, Transaction } from "@codemirror/state";
import {
  ViewUpdate,
  PluginValue,
  EditorView,
  ViewPlugin,
  DecorationSet,
  Decoration,
  WidgetType,
} from "@codemirror/view";
import type BetterWordCount from "src/main";
import { getWordCount } from "src/utils/StatUtils";

export const pluginField = StateField.define<BetterWordCount>({
  create() {
    return null;
  },
  update(state) {
    return state;
  },
});

class StatusBarEditorPlugin implements PluginValue {
  view: EditorView;

  constructor(view: EditorView) {
    this.view = view;
  }

  update(update: ViewUpdate): void {
    const tr = update.transactions[0];

    if (!tr) {
      return;
    }

    const plugin = update.view.state.field(pluginField);

    // When selecting text with Shift+Home the userEventType is undefined.
    // This is probably a bug in codemirror, for the time being doing an explict check
    // for the type allows us to update the stats for the selection.
    const userEventTypeUndefined = tr.annotation(Transaction.userEvent) === undefined;

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
      plugin.statusBar.debounceStatusBarUpdate(text);
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
      if (tr.docChanged && plugin.statsManager) {
        plugin.statsManager.debounceChange(text);
      }
      plugin.statusBar.debounceStatusBarUpdate(text);
    }
  }

  destroy() {}
}

export const statusBarEditorPlugin = ViewPlugin.fromClass(StatusBarEditorPlugin);

interface SectionCountData {
  line: number;
  level: number;
  self: number;
  total: number;
  pos: number;
}

class SectionWidget extends WidgetType {
  plugin: BetterWordCount;
  data: SectionCountData;

  constructor(plugin: BetterWordCount, data: SectionCountData) {
    super();
    this.plugin = plugin;
    this.data = data;
  }

  eq(widget: this): boolean {
    const { pos, self, total } = this.data;
    return pos === widget.data.pos && self === widget.data.self && total === widget.data.total;
  }

  getDisplayText() {
    const { self, total } = this.data;
    if (self && self !== total) {
      return `${self} / ${total}`;
    }
    return total.toString();
  }

  toDOM() {
    return createSpan({ cls: "bwc-section-count", text: this.getDisplayText() });
  }
}

class SectionWordCountEditorPlugin implements PluginValue {
  decorations: DecorationSet;
  lineCounts: any[] = [];

  constructor(view: EditorView) {
    const plugin = view.state.field(pluginField);
    if (!plugin.settings.displaySectionCounts) {
      this.decorations = Decoration.none;
      return;
    }

    this.calculateLineCounts(view.state.doc);
    this.decorations = this.mkDeco(view);
  }

  calculateLineCounts(doc: Text) {
    for (let index = 0; index < doc.lines; index++) {
      const line = doc.line(index + 1);
      this.lineCounts.push(getWordCount(line.text));
    }
  }

  update(update: ViewUpdate) {
    const plugin = update.view.state.field(pluginField);
    const { displaySectionCounts } = plugin.settings;
    let didSettingsChange = false;

    if (this.lineCounts.length && !displaySectionCounts) {
      this.lineCounts = [];
      this.decorations = Decoration.none;
      return;
    } else if (!this.lineCounts.length && displaySectionCounts) {
      didSettingsChange = true;
      this.calculateLineCounts(update.startState.doc);
    }

    if (update.docChanged) {
      const startDoc = update.startState.doc;
      let tempDoc = startDoc;

      update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
        const from = fromB;
        const to = fromB + (toA - fromA);
        const nextTo = from + text.length;

        const fromLine = tempDoc.lineAt(from);
        const toLine = tempDoc.lineAt(to);

        tempDoc = tempDoc.replace(fromB, fromB + (toA - fromA), text);

        const fromLineNext = tempDoc.lineAt(from);
        const toLineNext = tempDoc.lineAt(nextTo);

        const lines: any[] = [];

        for (let i = fromLineNext.number; i <= toLineNext.number; i++) {
          lines.push(getWordCount(tempDoc.line(i).text));
        }

        const spliceStart = fromLine.number - 1;
        const spliceLen = toLine.number - fromLine.number + 1;

        this.lineCounts.splice(spliceStart, spliceLen, ...lines);
      });
    }

    if (update.docChanged || update.viewportChanged || didSettingsChange) {
      this.decorations = this.mkDeco(update.view);
    }
  }

  mkDeco(view: EditorView) {
    const plugin = view.state.field(pluginField);
    const b = new RangeSetBuilder<Decoration>();
    if (!plugin.settings.displaySectionCounts) return b.finish();

    const getHeaderLevel = (line: Line) => {
      const match = line.text.match(/^(#+)[ \t]/);
      return match ? match[1].length : null;
    };

    const doc = view.state.doc;
    const lineCount = doc.lines;
    const sectionCounts: SectionCountData[] = [];
    const nested: SectionCountData[] = [];

    for (const { from } of view.visibleRanges) {
      const lineStart = doc.lineAt(from);

      for (let i = lineStart.number, len = lineCount; i <= len; i++) {
        let line: Line;
        if (i === lineStart.number) line = lineStart;
        else line = doc.line(i);

        const level = getHeaderLevel(line);
        const prevHeading = nested.last();
        if (level) {
          if (!prevHeading || level > prevHeading.level) {
            nested.push({
              line: i,
              level,
              self: 0,
              total: 0,
              pos: line.to,
            });
          } else if (prevHeading.level === level) {
            const nestedHeading = nested.pop();
            sectionCounts.push(nestedHeading);
            nested.push({
              line: i,
              level,
              self: 0,
              total: 0,
              pos: line.to,
            });
          } else if (prevHeading.level > level) {
            // Traversing to lower level heading (eg. ### -> ##)
            for (let j = nested.length - 1; j >= 0; j--) {
              const nestedHeading = nested[j];

              if (level < nestedHeading.level) {
                // Continue traversing to lower level heading
                const nestedHeading = nested.pop();
                sectionCounts.push(nestedHeading);
                if (j === 0) {
                  nested.push({
                    line: i,
                    level,
                    self: 0,
                    total: 0,
                    pos: line.to,
                  });
                }
                continue;
              }

              if (level === nestedHeading.level) {
                // Stop because we found an equal level heading
                const nestedHeading = nested.pop();
                sectionCounts.push(nestedHeading);
                nested.push({
                  line: i,
                  level,
                  self: 0,
                  total: 0,
                  pos: line.to,
                });
                break;
              }

              if (level > nestedHeading.level) {
                // Stop because we found an higher level heading
                nested.push({
                  line: i,
                  level,
                  self: 0,
                  total: 0,
                  pos: line.to,
                });
                break;
              }
            }
          }
        } else if (nested.length) {
          const count = this.lineCounts[i - 1];
          for (const heading of nested) {
            if (heading === prevHeading) {
              heading.self += count;
            }
            heading.total += count;
          }
        }
      }
    }

    if (nested.length) sectionCounts.push(...nested);

    sectionCounts.sort((a, b) => a.line - b.line);

    for (const data of sectionCounts) {
      b.add(
        data.pos,
        data.pos,
        Decoration.widget({
          side: 1,
          widget: new SectionWidget(plugin, data),
        })
      );
    }

    return b.finish();
  }
}

export const settingsChanged = StateEffect.define<void>();
export const sectionWordCountEditorPlugin = ViewPlugin.fromClass(SectionWordCountEditorPlugin, {
  decorations: (v) => v.decorations,
});
