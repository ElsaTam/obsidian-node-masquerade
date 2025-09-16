import { AbstractInputSuggest, ButtonComponent, ExtraButtonComponent, getLanguage, Modal, SearchComponent, TextComponent, TFile } from "obsidian";
import NodeMasqueradePlugin from "./main";
import { t } from "./i18n";

export class SettingMultiPropertiesModal extends Modal {
    inputs: TextComponent[] = [];
    propertiesDiv: HTMLDivElement;

    constructor(private plugin: NodeMasqueradePlugin) {
        super(plugin.app);
        this.setTitle(t("namesUseProperties"));
        this.modalEl.addClass("graph-modal-setting-properties");
    }

    onOpen() {
        this.addAddButton();
        this.loadProperties();
    }

    private addAddButton() {
        this.contentEl.createSpan().textContent = t("namesUsePropertiesAdd");

        const addButton = new ButtonComponent(this.contentEl)
            .onClick(() => {
                this.addProperty("");
            })
            .setIcon('plus')
            .setTooltip(t("add"));
        addButton.buttonEl.addClass("node-masquerade-add-button");
    }

    private loadProperties() {
        this.propertiesDiv = this.contentEl.createDiv("properties-list");
        for (const property of this.plugin.settings.usePropertiesForName) {
            this.addProperty(property);
        }
    }

    private addProperty(property: string) {
        const inputDiv = this.propertiesDiv.createDiv("property-value");
        let oldKey = property;

        const input = new SearchComponent(inputDiv)
            .setValue(property)
            .onChange(key => {
                if (this.renameProperty(oldKey, key)) {
                    oldKey = key;
                }
            });
        new PropertiesSuggester(this.plugin, input.inputEl, (key: string) => {
            if (this.renameProperty(oldKey, key)) {
                oldKey = key;
            }
        });
        this.inputs.push(input);

        const deleteButton = new ExtraButtonComponent(inputDiv)
            .onClick(() => {
                this.deleteProperty(inputDiv, input);
            })
            .setIcon('trash-2')
            .setTooltip(t("delete"));
        deleteButton.extraSettingsEl.addClass("node-masquerade-delete-button");
    }

    private deleteProperty(inputDiv: HTMLElement, input: SearchComponent) {
        this.inputs.remove(input);
        this.plugin.settings.usePropertiesForName.remove(input.getValue());
        inputDiv.remove();
        this.plugin.saveSettings().then(() => {
            if (this.plugin.settings.enable) this.plugin.rewriteNames();
        });
    }

    private renameProperty(oldKey: string, newKey: string): boolean {
        if (!this.plugin.settings.usePropertiesForName.contains(newKey) && newKey !== oldKey) {
            this.plugin.settings.usePropertiesForName.remove(oldKey);
            this.plugin.settings.usePropertiesForName.push(newKey);
            this.plugin.saveSettings().then(() => {
                if (this.plugin.settings.enable) this.plugin.rewriteNames();
            });
            return true;
        }
        return false;
    }

    onClose(): void {
        this.contentEl.empty();
    }
}

class PropertiesSuggester extends AbstractInputSuggest<HTMLElement> {

    constructor(private plugin: NodeMasqueradePlugin, textInputEl: HTMLInputElement | HTMLDivElement, private callback: (value: string) => void) {
        super(plugin.app, textInputEl);
    }

    protected override getSuggestions(query: string): HTMLElement[] {
        return this.getStringSuggestions(query).sort((a, b) => a.localeCompare(b, getLanguage(), { sensitivity: 'base' })).map(value => {
            const match = new RegExp(query, "i").exec(value);
            const el = createDiv();
            if (match && match[0].length > 0) {
                if (match.index > 0) {
                    el.appendText(value.substring(0, match.index));
                }
                el.createEl("strong", { cls: "suggestion-highlight" }, strong => strong.setText(match[0]));
                if (match.index + match[0].length < value.length) {
                    el.appendText(value.substring(match.index + match[0].length));
                }
            }
            else {
                el.setText(value);
            }
            return el;
        });
    }

    private getStringSuggestions(query: string): string[] {
        const values = this.getAllVaultProperties();
        const filteredValues = values.filter(value => new RegExp(query, "i").exec(value));
        return [...new Set(filteredValues)];
    }

    private getAllVaultProperties(): string[] {
        return this.plugin.app.vault.getFiles().reduce((acc: string[], file: TFile) => {
            const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;
            if (frontmatter) {
                return acc.concat(Object.keys(frontmatter));
            }
            return acc;
        }, [])
    }

    override selectSuggestion(value: HTMLElement, evt: MouseEvent | KeyboardEvent): void {
        this.setValue(value.innerText);
        this.callback(value.innerText);
        this.close();
    }

    override renderSuggestion(value: HTMLElement, el: HTMLElement): void {
        for (const suggestionNode of Array.from(value.childNodes)) {
            el.appendChild(suggestionNode.cloneNode(true));
        }
    }
}