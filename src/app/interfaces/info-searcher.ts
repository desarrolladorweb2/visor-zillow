export interface infoSeacher {
    AcreditadoIdenti: string;
    AcreditadoNom: string;
    AcreditadoNum: string;
    AcreditadoNumCuen: string;
    Acreditado_Id: string;
    AcreditadosEst: string;
    TipoPersona_Id: string;
    Direccion_Id: string;
    TipoDireccionCod: string;
}

export interface infoSeachersResponse {
    SDT_Acreditados: infoSeacher[];
}
