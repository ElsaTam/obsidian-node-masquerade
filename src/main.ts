import { App, Plugin, View, WorkspaceLeaf } from 'obsidian';
import { GraphBannerPlugin, MasqueradeGraphNode } from './interfaces';
import { GraphView, LocalGraphView } from 'obsidian-typings';
import { NodeMasqueradeSettingTab } from './settingTab';
import { getFirstPropertiesValue } from './utils';
import { NodeMasqueradeSettings, DEFAULT_SETTINGS } from './settings';
import { t } from './i18n';



function createGetDisplayText(app: App) {
	return function getDisplayText(this: MasqueradeGraphNode): string {
		const settings = NodeMasqueradePlugin.displaySettings;

		let name = settings.usePropertiesForName ? getFirstPropertiesValue(app, this.id, settings.usePropertiesForName) : undefined;
		if (!name && this.nm_originalGetDisplayText) name = this.nm_originalGetDisplayText();
		if (!name) {
			throw new Error("nm_originalGetDisplayText does not exist on node");
		}

		if (settings.showOnlyFileName) {
			name = name.split("/").last() || name;
		}

		if (settings.noExtension) {
			name = name.replace(/\.[^/.]+$/, "");
		}

		if (settings.numberOfCharacters && settings.numberOfCharacters > 0) {
			if (name.length > settings.numberOfCharacters) {
				name = name.slice(0, settings.numberOfCharacters) + settings.ellipsis;
			}
		}

		return name;
	}
}


export default class NodeMasqueradePlugin extends Plugin {
	settings: NodeMasqueradeSettings;
	modifiedPrototypes: MasqueradeGraphNode[] = [];

	static displaySettings: Omit<NodeMasqueradeSettings, "enable">;

	async onload() {
		await this.loadSettings();
		NodeMasqueradePlugin.displaySettings = this.settings;

		this.app.workspace.onLayoutReady(() => {
			this.onLayoutChange();
		});
		this.app.workspace.on('layout-change', () => {
			this.onLayoutChange();
		})

		this.addSettingTab(new NodeMasqueradeSettingTab(this.app, this));

		this.addCommand({
			id: 'node-masquerade-disable',
			name: t("disable"),
			checkCallback: (checking: boolean) => {
				if (this.settings.enable) {
					if (!checking) {
						this.settings.enable = false;
						this.saveSettings();
						this.restorePrototypes();
					}
					return true
				}
				return false;
			},
		});

		this.addCommand({
			id: 'node-masquerade-enable',
			name: t("enable"),
			checkCallback: (checking: boolean) => {
				if (!this.settings.enable) {
					if (!checking) {
						this.settings.enable = true;
						this.saveSettings();
						this.overridePrototypes();
					}
					return true
				}
				return false;
			},
		});
	}

	async onLayoutChange() {
		if (!this.settings.enable) return;
		if (!this.app.internalPlugins.getPluginById("graph")?._loaded) return;
		this.overridePrototypes();
	}

	private getGraphLeaves(): WorkspaceLeaf[] {
		let leaves: WorkspaceLeaf[] = [];
		leaves = leaves.concat(this.app.workspace.getLeavesOfType('graph'));
		leaves = leaves.concat(this.app.workspace.getLeavesOfType('localgraph'));
		leaves = leaves.concat(this.getGraphBannerPlugin()?.graphViews.map(v => v.leaf) || []);
		return [...(new Set(leaves))];
	}

	private getGraphBannerPlugin(): GraphBannerPlugin | undefined {
		const graphBannerPlugin = this.app.plugins.getPlugin('graph-banner');
		return graphBannerPlugin ? (graphBannerPlugin as GraphBannerPlugin) : undefined;
	}

	onunload() {
		this.restorePrototypes();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private overridePrototypes() {
		const leaves = this.getGraphLeaves();
		for (const leaf of leaves) {
			if (!(leaf.view instanceof View) || leaf.isDeferred) continue;
			const view = leaf.view as GraphView | LocalGraphView;
			this.overridePrototype(view);
		}
	}

	private overridePrototype(view: GraphView | LocalGraphView) {
		const node = view.renderer.nodes.first();
		if (node) {
			const proto = node.constructor.prototype;
			if (!proto.hasOwnProperty("nm_originalGetDisplayText") && !this.modifiedPrototypes.contains(proto)) {
				proto.nm_originalGetDisplayText = proto.getDisplayText;
				proto.getDisplayText = createGetDisplayText(this.app);
				for (const node of view.renderer.nodes) {
					if (node.text) {
						node.text.text = node.getDisplayText();
					}
					view.renderer.changed();
				}
				this.modifiedPrototypes.push(proto);
			}
		}
	}

	private restorePrototypes() {
		for (const proto of this.modifiedPrototypes) {
			if (typeof proto.nm_originalGetDisplayText === "function") {
				proto.getDisplayText = proto.nm_originalGetDisplayText;
				delete proto.nm_originalGetDisplayText;
			}
		}
		this.modifiedPrototypes = [];
		this.rewriteNames();
	}

	rewriteNames() {
		const leaves = this.getGraphLeaves();
		for (const leaf of leaves) {
			if (!(leaf.view instanceof View) || leaf.isDeferred) continue;
			const view = leaf.view as GraphView | LocalGraphView;
			for (const node of view.renderer.nodes) {
				if (node.text) node.text.text = node.getDisplayText();
			}
			view.renderer.changed();
		}
	}
}

