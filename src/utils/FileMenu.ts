import { Menu, TAbstractFile, TFile } from "obsidian";
import type BetterWordCount from "src/main";
import { FolderStatisticsModal } from "src/view/FolderStatisticsModal";

export function handleFileMenu(menu: Menu, file: TAbstractFile, source: string, plugin: BetterWordCount): void {
    if (source !== "file-explorer-context-menu") {
        return;
    }
    if (!file) {
        return;
    }
    // Make sure the menu only shows up for folders
    if (file instanceof TFile) {
        return;
    }
    menu.addItem((item) => {
        item.setTitle(`Count Words`)
            .setIcon("info")
            .setSection("action")
            .onClick(async (_) => {
                new FolderStatisticsModal(plugin, file).open();
            });
    });
}