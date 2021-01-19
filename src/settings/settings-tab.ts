import { settings } from "cluster";
import { PluginSettingTab, Setting } from "obsidian";
import BetterWordCount from "../main";

export class BetterWordCountSettingsTab extends PluginSettingTab {
  display(): void {
    let { containerEl } = this;
    const plugin: BetterWordCount = (this as any).plugin;

    containerEl.empty();
    containerEl.createEl("h2", { text: "Better Word Count Settings" });

    // Word Count Settings
    containerEl.createEl("h3", { text: "Word Count Settings" });
    new Setting(containerEl)
      .setName("Show Word Count")
      .setDesc("Enable this to show the word count.")
      .addToggle((boolean) =>
        boolean.setValue(plugin.settings.showWords).onChange((value) => {
          plugin.settings.showWords = value;
          plugin.saveData(plugin.settings);
        })
      );
    new Setting(containerEl)
      .setName("Word Count Prefix")
      .setDesc("This changes the text in front of the word count number.")
      .addText((text) =>
        text.setValue(plugin.settings.wordsPrefix).onChange((value) => {
          plugin.settings.wordsPrefix = value;
          plugin.saveData(plugin.settings);
        })
      );
    new Setting(containerEl)
      .setName("Word Count Suffix")
      .setDesc("This changes the text after of the word count number.")
      .addText((text) =>
        text.setValue(plugin.settings.wordsSuffix).onChange((value) => {
          plugin.settings.wordsSuffix = value;
          plugin.saveData(plugin.settings);
        })
      );

    // Character Count Settings
    containerEl.createEl("h3", { text: "Character Count Settings" });
    new Setting(containerEl)
      .setName("Show Character Count")
      .setDesc("Enable this to show the character count.")
      .addToggle((boolean) =>
        boolean.setValue(plugin.settings.showCharacters).onChange((value) => {
          plugin.settings.showCharacters = value;
          plugin.saveData(plugin.settings);
        })
      );
    new Setting(containerEl)
      .setName("Character Count Prefix")
      .setDesc("This changes the text in front of the character count number.")
      .addText((text) =>
        text.setValue(plugin.settings.charactersPrefix).onChange((value) => {
          plugin.settings.charactersPrefix = value;
          plugin.saveData(plugin.settings);
        })
      );
    new Setting(containerEl)
      .setName("Character Count Suffix")
      .setDesc("This changes the text after of the character count number.")
      .addText((text) =>
        text.setValue(plugin.settings.charactersSuffix).onChange((value) => {
          plugin.settings.charactersSuffix = value;
          plugin.saveData(plugin.settings);
        })
      );

    // Sentence Count Settings
    containerEl.createEl("h3", { text: "Sentence Count Settings" });
    new Setting(containerEl)
      .setName("Show Sentence Count")
      .setDesc("Enable this to show the sentence count.")
      .addToggle((boolean) =>
        boolean.setValue(plugin.settings.showSentences).onChange((value) => {
          plugin.settings.showSentences = value;
          plugin.saveData(plugin.settings);
        })
      );
    new Setting(containerEl)
      .setName("Sentence Count Prefix")
      .setDesc("This changes the text in front of the sentence count number.")
      .addText((text) =>
        text.setValue(plugin.settings.sentencesPrefix).onChange((value) => {
          plugin.settings.sentencesPrefix = value;
          plugin.saveData(plugin.settings);
        })
      );
    new Setting(containerEl)
      .setName("Sentence Count Suffix")
      .setDesc("This changes the text after of the sentence count number.")
      .addText((text) =>
        text.setValue(plugin.settings.sentencesSuffix).onChange((value) => {
          plugin.settings.sentencesSuffix = value;
          plugin.saveData(plugin.settings);
        })
      );
  }
}
