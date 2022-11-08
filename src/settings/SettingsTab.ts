import {
  App,
  DropdownComponent,
  PluginSettingTab,
  Setting,
  TextAreaComponent,
  ToggleComponent,
} from "obsidian";
import type BetterWordCount from "src/main";
import type { StatusBarItem } from "./Settings";
import { addStatusBarSettings } from "./StatusBarSettings";

export const details = (text: string, parent: HTMLElement) =>
  parent.createEl("details", {}, (d) => d.createEl("summary", { text }));

export class BetterWordCountSettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: BetterWordCount) {
    super(app, plugin);
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();
    containerEl.createEl("h3", { text: "Better Word Count Settings" });

    // General Settings
    containerEl.createEl("h4", { text: "General Settings" });
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
    containerEl
      .createEl("h4", { text: "Status Bar Settings" })
      .addClass("bwc-status-bar-settings-title");
    containerEl.createEl("p", {
      text: "Here you can customize what statistics are displayed on the status bar.",
    });

    addStatusBarSettings(this.plugin, containerEl);
  }
}
