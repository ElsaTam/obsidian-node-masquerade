import { App, getLinkpath } from "obsidian";

export function pathParse(path: string, ext?: string) {
    if (!path) return { path, basename: "", ext: "" };

    path = path.replace(/\/+$/, ''); // Remove trailing slashes (if any)
    const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));

    const base = lastSlashIndex === -1 ? path : path.substring(lastSlashIndex + 1);

    if (!ext) {
        const lastDotIndex = base.lastIndexOf('.');
        ext = lastDotIndex === -1 ? "" : base.substring(lastDotIndex);
    }
    else if (!base.contains(ext)) {
        throw new Error(`The path "${path}" is not of extension "${ext}".`);
    }

    if (!ext.startsWith(".") && ext) {
        ext = "." + ext;
    }

    let basename: string;
    if (ext.length > 1) {
        const lastExtIndex = base.lastIndexOf(ext);
        basename = lastExtIndex === -1 ? base : base.substring(0, lastExtIndex);
    }
    else {
        basename = base;
    }

    return {
        path,
        basename,
        ext
    }
}

function recursiveGetProperties(value: any, types: Set<string>): void {
    if (!value) return;
    if (typeof value === "string") {
        if (value.startsWith("[[") && value.endsWith("]]")) {
            const linkPath = getLinkpath(value.slice(2, value.length - 2));
            const displayTextIndex = linkPath.indexOf("|");
            const filepath = displayTextIndex >= 0 ? linkPath.slice(0, displayTextIndex) : linkPath;
            types.add(pathParse(filepath).basename);
        }
        else {
            types.add(value);
        }
    }
    else if (typeof value === "number") {
        types.add(String(value));
    }
    else if (typeof value === "boolean") {
        types.add(String(value));
    }
    else if ((typeof value === "object") && ("path" in value)) {
        // Dataview
        types.add(pathParse(value.path).basename);
    }
    else if (Array.isArray(value)) {
        for (const v of value) {
            recursiveGetProperties(v, types);
        }
    }
}

export function getFirstPropertiesValue(app: App, path: string, properties: string[]): string | undefined {
    const values = new Set<string>();
    const file = app.vault.getFileByPath(path);
    if (!file) return;
    for (const property of properties) {
        const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
        if (frontmatter?.hasOwnProperty(property)) {
            recursiveGetProperties(frontmatter[property], values);
        }
        for (const value of values) {
            if (value !== undefined && value !== null) {
                return value.toString();
            }
        }
    }
}