package com.cardiovision.api.controller;

import com.cardiovision.api.dto.ApiResponse;
import com.cardiovision.api.dto.DashboardDto;
import com.cardiovision.api.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard & Analytics APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary", description = "Returns summary statistics for the dashboard")
    public ResponseEntity<ApiResponse.Success<DashboardDto.Summary>> getSummary() {
        return ResponseEntity.ok(ApiResponse.Success.<DashboardDto.Summary>builder()
                .message("Dashboard summary retrieved")
                .data(dashboardService.getSummary())
                .build());
    }

    @GetMapping("/charts")
    @Operation(summary = "Get chart data", description = "Returns chart data for dashboard visualizations")
    public ResponseEntity<ApiResponse.Success<DashboardDto.ChartData>> getChartData() {
        return ResponseEntity.ok(ApiResponse.Success.<DashboardDto.ChartData>builder()
                .message("Chart data retrieved")
                .data(dashboardService.getChartData())
                .build());
    }
}
