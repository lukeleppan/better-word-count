import {
  App,
  DropdownComponent,
  PluginSettingTab,
  Setting,
  TextAreaComponent,
  ToggleComponent,
} from "obsidian";
import type BetterWordCount from "../main";
import { BetterWordCountSettings, DEFAULT_SETTINGS } from "./settings";

export class BetterWordCountSettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: BetterWordCount) {
    super(app, plugin);
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();
    containerEl.createEl("h2", { text: "Better Word Count Settings" });

    // General Settings
    containerEl.createEl("h3", { text: "General Settings" });
    new Setting(containerEl)
      .setName("Collect Statistics")
      .setDesc(
        "Reload Required for change to take effect. Turn on to start collecting daily statistics of your writing. Stored in the .vault-stats file in the root of your vault. This is required for counts of the day."
      )
      .addToggle((cb: ToggleComponent) => {
        cb.setValue(this.plugin.settings.collectStats);
        cb.onChange(async (value: boolean) => {
          this.plugin.settings.collectStats = value;
          await this.plugin.saveSettings();
        });
      });
    new Setting(containerEl)
      .setName("Don't Count Comments")
      .setDesc("Turn on if you don't want markdown comments to be counted.")
      .addToggle((cb: ToggleComponent) => {
        cb.setValue(this.plugin.settings.countComments);
        cb.onChange(async (value: boolean) => {
          this.plugin.settings.countComments = value;
          await this.plugin.saveSettings();
        });
      });

    // Status Bar Settings
    containerEl.createEl("h3", { text: "Status Bar Settings" });
    new Setting(containerEl)
      .setName("Select a Preset")
      .setDesc(
        "Presets are premade status bar expressions. Overides status bar settings."
      )
      .addDropdown((cb: DropdownComponent) => {
        PRESETS.forEach((preset: PresetOption) => {
          cb.addOption(preset.name, preset.name);
        });
        cb.setValue(this.plugin.settings.preset.name);

        cb.onChange(async (value: string) => {
          let newPreset = PRESETS.find((preset) => preset.name === value);
          this.plugin.settings.preset = newPreset;
          this.plugin.settings.statusBarQuery = newPreset.statusBarQuery;
          this.plugin.settings.statusBarAltQuery = newPreset.statusBarAltQuery;
          await this.plugin.saveSettings();
        });
      });
    new Setting(containerEl)
      .setName("Status Bar Text")
      .setDesc("Customize the Status Bar text with this.")
      .addTextArea((cb: TextAreaComponent) => {
        cb.setPlaceholder("Enter an expression...");
        cb.setValue(this.plugin.settings.statusBarQuery);
        cb.onChange((value: string) => {
          let newPreset = PRESETS.find((preset) => preset.name === "custom");
          this.plugin.settings.preset = newPreset;
          this.plugin.settings.statusBarQuery = value;
          this.plugin.saveSettings();
        });
      });
    new Setting(containerEl)
      .setName("Alternative Status Bar Text")
      .setDesc("Customize the Alternative Status Bar text with this.")
      .addTextArea((cb: TextAreaComponent) => {
        cb.setPlaceholder("Enter an expression...");
        cb.setValue(this.plugin.settings.statusBarAltQuery);
        cb.onChange((value: string) => {
          let newPreset = PRESETS.find((preset) => preset.name === "custom");
          this.plugin.settings.preset = newPreset;
          this.plugin.settings.statusBarAltQuery = value;
          this.plugin.saveSettings();
        });
      });

    this.containerEl.createEl("h3", {
      text: "Syntax for the status bars works like this: ",
    });

    this.containerEl.createEl("li", {
      text: "To get a stat input the name of the stat in between `{}` eg. `{word_count}`.",
    });

    this.containerEl.createEl("li", {
      text: "All other words remain.",
    });

    this.containerEl.createEl("br");

    this.containerEl.createEl("h4", {
      text: "Available Stats:",
    });

    this.containerEl.createEl("p", {
      text:
        "word_count, " +
        "character_count, " +
        "sentence_count, " +
        "total_word_count, " +
        "total_character_count, " +
        "total_sentence_count, " +
        "file_count, " +
        "words_today, " +
        "characters_today, " +
        "sentences_today, ",
    });
  }
}
