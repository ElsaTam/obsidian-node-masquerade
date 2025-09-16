# Node Masquerade

This plugin is based on my original and bigger plugin [Extended Graph](https://github.com/ElsaTam/obsidian-extended-graph), but focus only on modifying the nodes names. It aims at being more efficient for big vaults while offering only a specific subset of features.

## Installation

For now, it is only available through BRAT:
1. Install and enable the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) in your vault.
2. Navigate to `Settings > BRAT > Beta Plugin List > Add Beta Plugin`.
3. Enter `https://github.com/ElsaTam/obsidian-node-masquerade` into the input field and select `Add Plugin`.

## Usage

Unlike the Extended Graph plugin, the Node Masquerade plugin will always be enabled by default and settings will be applied dynamically. You can toggle it from the command palette in case you want to display back the original names of your nodes.

## Features

- Set a [characters limit](https://github.com/ElsaTam/obsidian-extended-graph/wiki/Node-names#characters-limit) to your node names to avoid very long text in the graph view.
- Display the [filename only](https://github.com/ElsaTam/obsidian-extended-graph/wiki/Node-names#filename-only) for attachments nodes.
- [Hide the extensions](https://github.com/ElsaTam/obsidian-extended-graph/wiki/Node-names#hide-extensions) for attachments nodes.
- [Use properties](https://github.com/ElsaTam/obsidian-extended-graph/wiki/Node-names#use-properties) as nodes labels to replace the default file name.

## Compatibility

Because all of those features are already existing in the Extended Graph plugin, you should not have to use both. If you do and use different settings for the nodes names, there might be compatibility issues.