package com.bank.msbanking.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ReportResponseDto {
    private List<ReportDto> data;
    private String pdfBase64;
}
