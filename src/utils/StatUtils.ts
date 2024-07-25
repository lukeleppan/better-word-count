import type { Vault } from "obsidian";
import { MATCH_HTML_COMMENT, MATCH_COMMENT } from "src/constants";

const pattern = /\P{Z}*[\p{L}\p{N}]\P{Z}*/gu;
export function getWordCount(text: string): number {
  return (text.match(pattern) || []).length;
}

export function getCharacterCount(text: string): number {
  return text.length;
}

export function getFootnoteCount(text: string): number {
  const regularFn = text.match(/\[\^\S+](?!:)/g);
  const inlineFn = text.match(/\^\[[^^].+?]/g);

  let overallFn = 0;
  if (regularFn) overallFn += regularFn.length;
  if (inlineFn) overallFn += inlineFn.length;
  return overallFn;
}

export function getCitationCount(text: string): number {
  const pandocCitations = text.match(/@[A-Za-z0-9-]+[,;\]](?!\()/gi);
  if (!pandocCitations) return 0;
  const uniqueCitations = [...new Set(pandocCitations)].length;
  return uniqueCitations;
}

export function getSentenceCount(text: string): number {
  const sentences: number = (
    (text || "").match(
      /[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm
    ) || []
  ).length;

  return sentences;
}

export function getPageCount(text: string, pageWords: number): number {
  return parseFloat((getWordCount(text) / pageWords).toFixed(1));
}

export function getTotalFileCount(vault: Vault): number {
  return vault.getMarkdownFiles().length;
}

export function cleanComments(text: string): string {
  return text.replace(MATCH_COMMENT, "").replace(MATCH_HTML_COMMENT, "");
}
