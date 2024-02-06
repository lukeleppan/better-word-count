import { Modal, TAbstractFile } from "obsidian";
import type BetterWordCount from "src/main";
//@ts-ignore
import FolderStatistics from "./FolderStatistics.svelte";

// Modal to wrap the svelte component passing the required props
export class FolderStatisticsModal extends Modal {

    file: TAbstractFile;
    plugin: BetterWordCount;

    constructor(plugin: BetterWordCount, file: TAbstractFile) {
        super(plugin.app);
        this.plugin = plugin;
        this.file = file;
    }

    async onOpen(): Promise<void> {
        const { contentEl } = this;
        new FolderStatistics({
            target: contentEl,
            props: {
                plugin: this.plugin,
                file: this.file,
            },
        });
    }
    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}