export interface IPosition {
    [key: string]: number
}

export type TBuffer = Buffer | null;

export enum EReadType {
    readIntLE = 'readIntLE',
    readUIntLE = 'readUIntLE'
}
