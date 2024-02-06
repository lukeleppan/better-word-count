import type { TFile } from "obsidian";
import type BetterWordCount from "src/main";

// get all Markdown files in a folder and all subfolders
export function getAllFilesInFolder(
    plugin: BetterWordCount,
    path: string
): TFile[] {
    // get all files and filter them by the start of the path
    return plugin.app.vault
        .getMarkdownFiles()
        .filter((tFolder) => tFolder.path.startsWith(path));
}

// Function to convert a list of Files to a list of file contents
export async function getAllFileContentInFolder(files: TFile[]): Promise<string[]> {
    // Create a promise to read the file content for each file
    const readPromise = files.map((file) => {
        return file.vault.cachedRead(file);
    });
    // resolve all promises and return the array
    return (await Promise.all(readPromise));
}