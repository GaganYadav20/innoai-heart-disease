package com.cardiovision.api.controller;

import com.cardiovision.api.dto.ApiResponse;
import com.cardiovision.api.dto.AuthDto;
import com.cardiovision.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication & Authorization APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<ApiResponse.Success<AuthDto.AuthResponse>> login(
            @Valid @RequestBody AuthDto.LoginRequest request,
            HttpServletRequest httpRequest) {
        AuthDto.AuthResponse response = authService.login(request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.Success.<AuthDto.AuthResponse>builder()
                .message("Login successful")
                .data(response)
                .build());
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user account")
    public ResponseEntity<ApiResponse.Success<AuthDto.AuthResponse>> register(
            @Valid @RequestBody AuthDto.RegisterRequest request,
            HttpServletRequest httpRequest) {
        AuthDto.AuthResponse response = authService.register(request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.Success.<AuthDto.AuthResponse>builder()
                .message("Registration successful")
                .data(response)
                .build());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Get a new access token using refresh token")
    public ResponseEntity<ApiResponse.Success<AuthDto.AuthResponse>> refreshToken(
            @Valid @RequestBody AuthDto.RefreshRequest request) {
        AuthDto.AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.Success.<AuthDto.AuthResponse>builder()
                .message("Token refreshed")
                .data(response)
                .build());
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Send password reset email")
    public ResponseEntity<ApiResponse.Success<Void>> forgotPassword(
            @Valid @RequestBody AuthDto.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.Success.<Void>builder()
                .message("Password reset email sent")
                .build());
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using token")
    public ResponseEntity<ApiResponse.Success<Void>> resetPassword(
            @Valid @RequestBody AuthDto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.Success.<Void>builder()
                .message("Password reset successful")
                .build());
    }
}
