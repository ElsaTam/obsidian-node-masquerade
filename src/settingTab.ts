import { PluginSettingTab, App, Setting } from "obsidian";
import NodeMasqueradePlugin from "./main";
import { SettingMultiPropertiesModal } from "./settingPropertiesModal";
import { t } from "./i18n";

export class NodeMasqueradeSettingTab extends PluginSettingTab {
    plugin: NodeMasqueradePlugin;

    constructor(app: App, plugin: NodeMasqueradePlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.containerEl.addClass("node-masquerade-settings")
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        this.addNumberOfCharacters();
        this.addOnlyFilename();
        this.addNoExtension();
        this.addUseProperty();
    }

    private addNumberOfCharacters() {
        new Setting(this.containerEl)
            .setName(t("namesNumberOfCharacters"))
            .setDesc(t("namesNumberOfCharactersDesc"))
            .addText(cb => {
                cb.inputEl.addClass("small-input");
                cb.setValue(this.plugin.settings.numberOfCharacters?.toString() || '')
                    .onChange(async (value) => {
                        const intValue = parseInt(value);
                        if (!isNaN(intValue)) {
                            this.plugin.settings.numberOfCharacters = intValue;
                        }
                        else {
                            this.plugin.settings.numberOfCharacters = null;
                        }
                        await this.plugin.saveSettings();
                        if (this.plugin.settings.enable) this.plugin.rewriteNames();
                    })
            })
            .addText(cb => {
                cb.inputEl.addClass("small-input");
                cb.setPlaceholder(t("namesEllipsisPlaceholder"))
                cb.setValue(this.plugin.settings.ellipsis.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.ellipsis = value;
                        await this.plugin.saveSettings();
                        if (this.plugin.settings.enable) this.plugin.rewriteNames();
                    })
            });
    }

    private addOnlyFilename() {
        new Setting(this.containerEl)
            .setName(t("namesShowOnlyFileName"))
            .setDesc(t("namesShowOnlyFileNameDesc"))
            .addToggle(cb => {
                cb.setValue(this.plugin.settings.showOnlyFileName);
                cb.onChange(async (value) => {
                    this.plugin.settings.showOnlyFileName = value;
                    await this.plugin.saveSettings();
                    if (this.plugin.settings.enable) this.plugin.rewriteNames();
                })
            });
    }

    private addNoExtension() {
        new Setting(this.containerEl)
            .setName(t("namesNoExtension"))
            .setDesc(t("namesNoExtensionDesc"))
            .addToggle(cb => {
                cb.setValue(this.plugin.settings.noExtension);
                cb.onChange(async (value) => {
                    this.plugin.settings.noExtension = value;
                    await this.plugin.saveSettings();
                    if (this.plugin.settings.enable) this.plugin.rewriteNames();
                })
            });
    }

    private addUseProperty() {
        new Setting(this.containerEl)
            .setName(t("namesUseProperties"))
            .setDesc(t("namesUsePropertiesDesc"))
            .addExtraButton(cb => {
                cb.setIcon('mouse-pointer-click');
                cb.onClick(() => {
                    const modal = new SettingMultiPropertiesModal(
                        this.plugin
                    );
                    modal.open();
                })
            });
    }
}