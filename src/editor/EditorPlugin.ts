import { EditorState, Line, RangeSetBuilder, StateEffect, StateField, Transaction } from "@codemirror/state";
import {
  ViewUpdate,
  PluginValue,
  EditorView,
  ViewPlugin,
  DecorationSet,
  Decoration,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import type BetterWordCount from "src/main";
import { getWordCount } from "src/utils/StatUtils";
import { MATCH_COMMENT, MATCH_HTML_COMMENT } from "src/constants";

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
  data: SectionCountData;

  constructor(data: SectionCountData) {
    super();
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

const mdCommentRe = /%%/g;
class SectionWordCountEditorPlugin implements PluginValue {
  decorations: DecorationSet;
  lineCounts: any[] = [];

  constructor(view: EditorView) {
    const plugin = view.state.field(pluginField);
    if (!plugin.settings.displaySectionCounts) {
      this.decorations = Decoration.none;
      return;
    }

    this.calculateLineCounts(view.state, plugin);
    this.decorations = this.mkDeco(view);
  }

  calculateLineCounts(state: EditorState, plugin: BetterWordCount) {
    const stripComments = plugin.settings.countComments;
    let docStr = state.doc.toString();

    if (stripComments) {
      // Strip out comments, but preserve new lines for accurate positioning data
      const preserveNl = (match: string, offset: number, str: string) => {
        let output = '';
        for (let i = offset, len = offset + match.length; i < len; i++) {
          if (/[\r\n]/.test(str[i])) {
            output += str[i];
          }
        }
        return output;
      }
  
      docStr = docStr.replace(MATCH_COMMENT, preserveNl).replace(MATCH_HTML_COMMENT, preserveNl);
    }

    const lines = docStr.split(state.facet(EditorState.lineSeparator) || /\r\n?|\n/)

    for (let i = 0, len = lines.length; i < len; i++) {
      let line = lines[i];
      this.lineCounts.push(getWordCount(line));
    }
  }

  update(update: ViewUpdate) {
    const plugin = update.view.state.field(pluginField);
    const { displaySectionCounts, countComments: stripComments } = plugin.settings;
    let didSettingsChange = false;

    if (this.lineCounts.length && !displaySectionCounts) {
      this.lineCounts = [];
      this.decorations = Decoration.none;
      return;
    } else if (!this.lineCounts.length && displaySectionCounts) {
      didSettingsChange = true;
      this.calculateLineCounts(update.startState, plugin);
    }

    if (update.docChanged) {
      const startDoc = update.startState.doc;

      let tempDoc = startDoc;
      let editStartLine = Infinity;
      let editEndLine = -Infinity;

      update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
        const from = fromB;
        const to = fromB + (toA - fromA);
        const nextTo = from + text.length;
        
        const fromLine = tempDoc.lineAt(from);
        const toLine = tempDoc.lineAt(to);

        tempDoc = tempDoc.replace(fromB, fromB + (toA - fromA), text);

        const nextFromLine = tempDoc.lineAt(from);
        const nextToLine = tempDoc.lineAt(nextTo);
        const lines: any[] = [];

        for (let i = nextFromLine.number; i <= nextToLine.number; i++) {
          lines.push(getWordCount(tempDoc.line(i).text));
        }

        const spliceStart = fromLine.number - 1;
        const spliceLen = toLine.number - fromLine.number + 1;

        editStartLine = Math.min(editStartLine, spliceStart);
        editEndLine = Math.max(editEndLine, spliceStart + (nextToLine.number - nextFromLine.number + 1));

        this.lineCounts.splice(spliceStart, spliceLen, ...lines);
      });

      // Filter out any counts associated with comments in the lines that were edited
      if (stripComments) {
        const tree = syntaxTree(update.state);
        for (let i = editStartLine; i < editEndLine; i++) {
          const line = update.state.doc.line(i + 1);
          let newLine = '';
          let pos = 0;
          let foundComment = false;
  
          tree.iterate({
            enter(node) { 
              if (node.name && /comment/.test(node.name)) {
                foundComment = true;
                newLine += line.text.substring(pos, node.from - line.from);
                pos = node.to - line.from;
              }
            },
            from: line.from,
            to: line.to,
          });
  
          if (foundComment) {
            newLine += line.text.substring(pos);
            this.lineCounts[i] = getWordCount(newLine);
          }
        }
      }
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

    if (!view.visibleRanges.length) return b.finish();

    // Start processing from the beginning of the first visible range
    const { from } = view.visibleRanges[0];
    const doc = view.state.doc;
    const lineStart = doc.lineAt(from);
    const lineCount = doc.lines;
    const sectionCounts: SectionCountData[] = [];
    const nested: SectionCountData[] = [];

    for (let i = lineStart.number; i <= lineCount; i++) {
      let line: Line;
      if (i === lineStart.number) line = lineStart;
      else line = doc.line(i);

      const level = getHeaderLevel(line);
      const prevHeading = nested.last();
      if (level) {
        if (!prevHeading || level > prevHeading.level) {
          // The first heading or moving to a higher level eg. ## -> ###
          nested.push({
            line: i,
            level,
            self: 0,
            total: 0,
            pos: line.to,
          });
        } else if (prevHeading.level === level) {
          // Same level as the previous heading
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
        // Not in a heading, so add the word count of the line to the headings containing this line
        const count = this.lineCounts[i - 1];
        for (const heading of nested) {
          if (heading === prevHeading) {
            heading.self += count;
          }
          heading.total += count;
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
          widget: new SectionWidget(data),
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
