import { App, PluginSettingTab, Setting, ToggleComponent, TextComponent } from "obsidian";
import type BetterWordCount from "src/main";
import { addStatusBarSettings } from "./StatusBarSettings";

export default class BetterWordCountSettingsTab extends PluginSettingTab {
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
        "Reload required for change to take effect. Turn on to start collecting daily statistics of your writing. Stored in the path specified below. This is required for counts of the day as well as total counts."
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
    new Setting(containerEl)
        .setName("Don't Count Codeblocks")
        .setDesc("Turn on if you don't want codeblocks to be counted. (Note: This does not turn off counting mermaid codeblocks)")
        .addToggle((cb: ToggleComponent) => {
            cb.setValue(this.plugin.settings.countCodeblocks);
            cb.onChange(async (value: boolean) => {
                this.plugin.settings.countCodeblocks = value;
                await this.plugin.saveSettings();
            });
        });
    new Setting(containerEl)
        .setName("Don't Count Mermaid Diagrams")
        .setDesc("Turn on if you don't want mermaid diagram codeblocks to be counted.")
        .addToggle((cb: ToggleComponent) => {
            cb.setValue(this.plugin.settings.countMermaid);
            cb.onChange(async (value: boolean) => {
                this.plugin.settings.countMermaid = value;
                await this.plugin.saveSettings();
            });
        });
    new Setting(containerEl)
      .setName("Display Section Word Count")
      .setDesc("Turn on if you want to display section word counts next to headings.")
      .addToggle((cb: ToggleComponent) => {
        cb.setValue(this.plugin.settings.displaySectionCounts);
        cb.onChange(async (value: boolean) => {
          this.plugin.settings.displaySectionCounts = value;
          this.plugin.onDisplaySectionCountsChange();
          await this.plugin.saveSettings();
        });
      });
    new Setting(containerEl)
      .setName("Page Word Count")
      .setDesc("Set how many words count as one \"page\"")
      .addText((text: TextComponent) => {
        text.inputEl.type = "number";
        text
          .setPlaceholder("300")
          .setValue(String(this.plugin.settings.pageWords))
          .onChange(async (value: string) => {
            if (value) {
              this.plugin.settings.pageWords = parseInt(value);
            } else {
              this.plugin.settings.pageWords = 300;
            }
            await this.plugin.saveSettings();
          });
      });

    // Advanced Settings
    containerEl.createEl("h4", { text: "Advanced Settings" });
    new Setting(containerEl)
      .setName("Vault Stats File Path")
      .setDesc("Reload required for change to take effect. The location of the vault statistics file, relative to the vault root.")
      .addText((text: TextComponent) => {
        text
          .setPlaceholder(".obsidian/vault-stats.json")
          .setValue(this.plugin.settings.statsPath)
          .onChange(async (value: string) => {
            if (value) {
              this.plugin.settings.statsPath = value;
            } else {
              this.plugin.settings.statsPath = ".obsidian/vault-stats.json";
            }
            await this.plugin.saveSettings();
          });
      });

    // Status Bar Settings
    addStatusBarSettings(this.plugin, containerEl);
  }
}
