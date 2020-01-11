export interface IOptions {
    dir: string,
    file: string,
    length?: number,
    hasExtra?: boolean,
    uopFileExt?: string
}

export interface IHashes {
    [hash: string]: number
}

export interface IFile {
    ext?: string,
    path?: string,
    base?: string
}

export interface IEntries {
    lookup?: Int32Array,
    length?: Int32Array,
    extra?: Int32Array
}
