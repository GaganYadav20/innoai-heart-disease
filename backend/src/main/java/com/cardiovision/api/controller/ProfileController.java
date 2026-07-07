package com.cardiovision.api.controller;

import com.cardiovision.api.dto.ApiResponse;
import com.cardiovision.api.dto.AuthDto;
import com.cardiovision.api.dto.DashboardDto;
import com.cardiovision.api.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "User Profile APIs")
public class ProfileController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Get user profile")
    public ResponseEntity<ApiResponse.Success<DashboardDto.UserProfile>> getProfile() {
        return ResponseEntity.ok(ApiResponse.Success.<DashboardDto.UserProfile>builder()
                .message("Profile retrieved")
                .data(dashboardService.getProfile())
                .build());
    }

    @PutMapping
    @Operation(summary = "Update user profile")
    public ResponseEntity<ApiResponse.Success<DashboardDto.UserProfile>> updateProfile(
            @RequestBody DashboardDto.UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.Success.<DashboardDto.UserProfile>builder()
                .message("Profile updated")
                .data(dashboardService.updateProfile(request))
                .build());
    }

    @PutMapping("/password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse.Success<Void>> changePassword(
            @Valid @RequestBody AuthDto.ChangePasswordRequest request) {
        dashboardService.changePassword(request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.Success.<Void>builder()
                .message("Password changed successfully")
                .build());
    }
}
