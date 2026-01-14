package com.bank.msbanking.util;

import com.bank.msbanking.dto.ReportDto;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.List;

@Component
public class PdfGenerator {

    public String generateReportPdf(List<ReportDto> data) {
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);

            Paragraph title = new Paragraph("Reporte de Estado de Cuenta", fontTitle);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            
            
            addHeader(table, "Fecha");
            addHeader(table, "Cliente");
            addHeader(table, "Numero Cuenta");
            addHeader(table, "Tipo");
            addHeader(table, "Saldo Inicial");
            addHeader(table, "Estado");
            addHeader(table, "Movimiento");
            addHeader(table, "Saldo Disponible");

            
            for (ReportDto item : data) {
                table.addCell(item.getFecha());
                table.addCell(item.getCliente());
                table.addCell(item.getNumeroCuenta());
                table.addCell(item.getTipo());
                table.addCell(String.valueOf(item.getSaldoInicial()));
                table.addCell(String.valueOf(item.getEstado()));
                table.addCell(String.valueOf(item.getMovimiento()));
                table.addCell(String.valueOf(item.getSaldoDisponible()));
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
            return null;
        }

        return Base64.getEncoder().encodeToString(out.toByteArray());
    }

    private void addHeader(PdfPTable table, String headerTitle) {
        PdfPCell header = new PdfPCell();
        header.setPhrase(new Phrase(headerTitle));
        header.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(header);
    }
}
