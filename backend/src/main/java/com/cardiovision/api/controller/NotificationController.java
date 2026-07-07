package com.cardiovision.api.controller;

import com.cardiovision.api.dto.ApiResponse;
import com.cardiovision.api.entity.Notification;
import com.cardiovision.api.security.CustomUserDetails;
import com.cardiovision.api.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get user notifications")
    public ResponseEntity<ApiResponse.Success<Page<Notification>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        CustomUserDetails user = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(ApiResponse.Success.<Page<Notification>>builder()
                .data(notificationService.getUserNotifications(user.getId(), PageRequest.of(page, size)))
                .build());
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse.Success<Map<String, Long>>> getUnreadCount() {
        CustomUserDetails user = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(ApiResponse.Success.<Map<String, Long>>builder()
                .data(Map.of("count", notificationService.getUnreadCount(user.getId())))
                .build());
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse.Success<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.Success.<Void>builder()
                .message("Notification marked as read").build());
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse.Success<Void>> markAllAsRead() {
        CustomUserDetails user = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.Success.<Void>builder()
                .message("All notifications marked as read").build());
    }
}
