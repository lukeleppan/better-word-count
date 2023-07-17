import { RangeSetBuilder, StateEffect, StateField, Transaction } from "@codemirror/state";
import {
  ViewUpdate,
  PluginValue,
  EditorView,
  ViewPlugin,
  DecorationSet,
  Decoration,
  WidgetType,
} from "@codemirror/view";
import { App, HeadingCache, TFile, editorInfoField } from "obsidian";
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

interface HeadingRange {
  heading: HeadingCache;
  from: number;
  to: number;
}

function getHeadingRanges(app: App, file: TFile, end: number) {
  const fileCache = app.metadataCache.getFileCache(file);

  if (!fileCache?.headings?.length) return null;

  const nestedHeadings: HeadingCache[] = [];
  const ranges: HeadingRange[] = [];

  for (let i = 0, len = fileCache.headings.length; i < len; i++) {
    const heading = fileCache.headings[i];
    const lastHeading = nestedHeadings.last();
    const isLast = i === len - 1;

    if (!lastHeading || heading.level > lastHeading.level) {
      // First heading, or traversing to higher level heading (eg ## -> ###)
      nestedHeadings.push(heading);
    } else if (heading.level === lastHeading.level) {
      // Two headings of the same level
      const nestedHeading = nestedHeadings.pop();
      ranges.push({
        heading: nestedHeading,
        from: nestedHeading.position.end.offset,
        to: heading.position.start.offset,
      });
      nestedHeadings.push(heading);
    } else if (heading.level < lastHeading.level) {
      // Traversing to lower level heading (eg. ### -> ##)
      for (let j = nestedHeadings.length - 1; j >= 0; j--) {
        const nestedHeading = nestedHeadings[j];

        if (heading.level < nestedHeading.level) {
          // Continue traversing to lower level heading
          const nestedHeading = nestedHeadings.pop();
          ranges.push({
            heading: nestedHeading,
            from: nestedHeading.position.end.offset,
            to: heading.position.start.offset,
          });
          if (j === 0) {
            nestedHeadings.push(heading);
          }
          continue;
        }

        if (heading.level === nestedHeading.level) {
          // Stop because we found an equal level heading
          const nestedHeading = nestedHeadings.pop();
          ranges.push({
            heading: nestedHeading,
            from: nestedHeading.position.end.offset,
            to: heading.position.start.offset,
          });
          nestedHeadings.push(heading);
          break;
        }

        if (heading.level > nestedHeading.level) {
          // Stop because we found an higher level heading
          nestedHeadings.push(heading);
          break;
        }
      }
    } else if (isLast) {
      // Final heading
      nestedHeadings.push(heading);
    }

    if (isLast) {
      // Flush the remaining headings
      let nestedHeading: HeadingCache;
      while ((nestedHeading = nestedHeadings.pop())) {
        ranges.push({
          heading: nestedHeading,
          from: nestedHeading.position.end.offset,
          to: end,
        });
      }
    }
  }

  // Sort the headings in the order they appear in the document
  ranges.sort((a, b) => a.from - b.from);

  return ranges;
}

class SectionWordCountEditorPlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.mkDeco(view);
  }

  update(update: ViewUpdate) {
    const plugin = update.view.state.field(pluginField);
    if (!plugin.settings.displaySectionCounts) {
      if (this.decorations.size) {
        // Clear out any decorations
        this.decorations = this.mkDeco(update.view);
      }

      return;
    }

    update.transactions.forEach((tr) => {
      if (tr.effects.some((e) => e.is(metadataUpdated))) {
        // If metadata has been updated, rebuild the decorations
        this.decorations = this.mkDeco(update.view);
      } else if (update.docChanged) {
        // Otherwise just update their positions
        this.decorations = this.decorations.map(tr.changes);
      }
    });
  }

  mkDeco(view: EditorView) {
    const plugin = view.state.field(pluginField);
    const b = new RangeSetBuilder<Decoration>();
    if (!plugin.settings.displaySectionCounts) return b.finish();

    const { app, file } = view.state.field(editorInfoField);
    if (!file) return b.finish();

    const headingRanges = getHeadingRanges(app, file, view.state.doc.length - 1);
    if (!headingRanges?.length) return b.finish();

    for (let i = 0; i < headingRanges.length; i++) {
      const heading = headingRanges[i];
      const next = headingRanges[i + 1];
      const targetPos = heading.heading.position.start.offset;

      const totalCount = getWordCount(view.state.doc.slice(heading.from, heading.to).toString());
      let selfCount: number;

      if (next && next.heading.level > heading.heading.level) {
        const betweenCount = getWordCount(
          view.state.doc.slice(heading.from, next.heading.position.start.offset).toString()
        );
        if (betweenCount) selfCount = betweenCount;
      }

      b.add(
        targetPos,
        targetPos,
        Decoration.line({
          attributes: {
            class: "bwc-section-count",
            style: `--word-count: "${selfCount ? `${selfCount} / ${totalCount}` : totalCount.toString()}"`,
          },
        })
      );
    }

    return b.finish();
  }
}

export const metadataUpdated = StateEffect.define<void>();
export const sectionWordCountEditorPlugin = ViewPlugin.fromClass(SectionWordCountEditorPlugin, {
  decorations: (v) => v.decorations,
});
