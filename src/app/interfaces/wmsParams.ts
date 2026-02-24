export interface WmsParams {
    idVisor: string;
    workspace: string;
    layerName: string;
    labelName: string;
    format?: string;
    transparent?: boolean;
    version?: string;
    srs?: string;
    opacity: number
    visible: boolean;
    type: string;
}