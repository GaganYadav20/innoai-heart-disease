package com.cardiovision.api.controller;

import com.cardiovision.api.dto.ApiResponse;
import com.cardiovision.api.entity.AuditLog;
import com.cardiovision.api.entity.ModelVersion;
import com.cardiovision.api.entity.Notification;
import com.cardiovision.api.entity.User;
import com.cardiovision.api.repository.ModelVersionRepository;
import com.cardiovision.api.repository.UserRepository;
import com.cardiovision.api.service.AuditService;
import com.cardiovision.api.service.DashboardService;
import com.cardiovision.api.service.NotificationService;
import com.cardiovision.api.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin Management APIs")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditService auditService;
    private final DashboardService dashboardService;
    private final ModelVersionRepository modelVersionRepository;

    @GetMapping("/users")
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse.Success<Page<User>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<User> users = userRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.Success.<Page<User>>builder()
                .data(users).build());
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs")
    public ResponseEntity<ApiResponse.Success<Page<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action) {
        Page<AuditLog> logs = action != null
                ? auditService.getAuditLogsByAction(action, PageRequest.of(page, size))
                : auditService.getAuditLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.Success.<Page<AuditLog>>builder()
                .data(logs).build());
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get system analytics")
    public ResponseEntity<ApiResponse.Success<Map<String, Object>>> getAnalytics() {
        var summary = dashboardService.getSummary();
        return ResponseEntity.ok(ApiResponse.Success.<Map<String, Object>>builder()
                .data(Map.of(
                        "summary", summary,
                        "charts", dashboardService.getChartData()
                )).build());
    }

    @GetMapping("/models")
    @Operation(summary = "Get model versions")
    public ResponseEntity<ApiResponse.Success<List<ModelVersion>>> getModels() {
        return ResponseEntity.ok(ApiResponse.Success.<List<ModelVersion>>builder()
                .data(modelVersionRepository.findAll()).build());
    }

    @GetMapping("/health")
    @Operation(summary = "System health check")
    public ResponseEntity<ApiResponse.Success<Map<String, Object>>> healthCheck() {
        Runtime runtime = Runtime.getRuntime();
        return ResponseEntity.ok(ApiResponse.Success.<Map<String, Object>>builder()
                .data(Map.of(
                        "status", "UP",
                        "totalMemory", runtime.totalMemory(),
                        "freeMemory", runtime.freeMemory(),
                        "maxMemory", runtime.maxMemory(),
                        "processors", runtime.availableProcessors(),
                        "javaVersion", System.getProperty("java.version")
                )).build());
    }
}
