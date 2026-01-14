export interface ReportItem {
    "Fecha": string;
    "Cliente": string;
    "Numero Cuenta": string;
    "Tipo": string;
    "Saldo Inicial": number;
    "Estado": boolean;
    "Movimiento": number;
    "Saldo Disponible": number;
}

export interface ReportResponse {
    data: ReportItem[];
    pdfBase64: string;
}
