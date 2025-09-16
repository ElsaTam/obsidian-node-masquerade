export interface NodeMasqueradeSettings {
    numberOfCharacters: number | null;
    ellipsis: string;
    showOnlyFileName: boolean;
    noExtension: boolean;
    usePropertiesForName: string[];
    enable: boolean;
}

export const DEFAULT_SETTINGS: NodeMasqueradeSettings = {
    numberOfCharacters: null,
    ellipsis: "…",
    showOnlyFileName: false,
    noExtension: false,
    usePropertiesForName: [],
    enable: true,
}