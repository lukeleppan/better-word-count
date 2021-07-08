import {
  App,
  DropdownComponent,
  PluginSettingTab,
  Setting,
  TextAreaComponent,
  ToggleComponent,
} from "obsidian";
import type BetterWordCount from "src/main";
import { PRESETS, PresetOption } from "../settings/settings";

export class BetterWordCountSettingsTab extends PluginSettingTab {
  private disableTextAreas: boolean;

  constructor(app: App, private plugin: BetterWordCount) {
    super(app, plugin);
    this.disableTextAreas =
      this.plugin.settings.preset.name === "custom" ? false : true;
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
  }
}
