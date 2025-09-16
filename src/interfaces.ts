// ======================== Graph banner

import { Plugin, WorkspaceLeaf } from "obsidian";
import { GraphNode } from "obsidian-typings";

export interface GraphBannerPlugin extends Plugin {
    graphViews: {
        leaf: WorkspaceLeaf,
        node: Node,
    }[];
}

// ======================== GraphNodePrototype

export interface MasqueradeGraphNode extends GraphNode {
    nm_originalGetDisplayText?: () => string;
}