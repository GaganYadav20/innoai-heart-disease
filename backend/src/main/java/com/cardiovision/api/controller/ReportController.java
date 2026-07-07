package com.cardiovision.api.controller;

import com.cardiovision.api.dto.ApiResponse;
import com.cardiovision.api.entity.Report;
import com.cardiovision.api.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Medical Report APIs")
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/upload")
    @Operation(summary = "Upload report", description = "Upload a medical report file (PDF, PNG, JPEG, TIFF)")
    public ResponseEntity<ApiResponse.Success<Report>> uploadReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "notes", required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.Success.<Report>builder()
                .message("Report uploaded successfully")
                .data(reportService.uploadReport(file, title, notes))
                .build());
    }

    @GetMapping
    @Operation(summary = "Get reports", description = "Get paginated list of reports")
    public ResponseEntity<ApiResponse.PagedResponse<Page<Report>>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Report> result = reportService.getReports(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.PagedResponse.<Page<Report>>builder()
                .data(result)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report details")
    public ResponseEntity<ApiResponse.Success<Report>> getReport(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.Success.<Report>builder()
                .message("Report retrieved")
                .data(reportService.getReport(id))
                .build());
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download report file")
    public ResponseEntity<byte[]> downloadReport(@PathVariable UUID id) {
        Report report = reportService.getReport(id);
        byte[] data = reportService.downloadReport(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(report.getFileType()));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(report.getFileName()).build());

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete report")
    public ResponseEntity<ApiResponse.Success<Void>> deleteReport(@PathVariable UUID id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok(ApiResponse.Success.<Void>builder()
                .message("Report deleted")
                .build());
    }
}
