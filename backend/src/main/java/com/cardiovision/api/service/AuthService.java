package com.cardiovision.api.service;

import com.cardiovision.api.dto.AuthDto;
import com.cardiovision.api.entity.*;
import com.cardiovision.api.exception.BadRequestException;
import com.cardiovision.api.exception.DuplicateResourceException;
import com.cardiovision.api.exception.ResourceNotFoundException;
import com.cardiovision.api.repository.*;
import com.cardiovision.api.security.CustomUserDetails;
import com.cardiovision.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request, String ipAddress, String userAgent) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        // Check if account is locked
        if (user.isAccountLocked()) {
            throw new BadRequestException("Account is locked. Please try again later.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Reset failed attempts on successful login
            user.setFailedAttempts(0);
            user.setLastLogin(ZonedDateTime.now());
            userRepository.save(user);

            String accessToken = tokenProvider.generateAccessToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            // Audit log
            auditService.log(user.getId(), "LOGIN", "User", user.getId().toString(), ipAddress, userAgent, null);

            return buildAuthResponse(accessToken, refreshToken, user, userDetails);

        } catch (Exception e) {
            // Increment failed attempts
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= 5) {
                user.setLockedUntil(ZonedDateTime.now().plusMinutes(30));
                log.warn("Account locked for user: {}", user.getEmail());
            }
            userRepository.save(user);
            throw new BadRequestException("Invalid email or password");
        }
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request, String ipAddress, String userAgent) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        final String targetRoleName = (request.getRole() != null && request.getRole().equalsIgnoreCase("DOCTOR"))
                ? "ROLE_DOCTOR" : "ROLE_PATIENT";

        Role role = roleRepository.findByName(targetRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + targetRoleName));

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .emailVerified(true) // For demo; in production, send verification email
                .verificationToken(UUID.randomUUID().toString())
                .build();

        user.getRoles().add(role);
        user = userRepository.save(user);

        // Create profile based on role
        if (targetRoleName.equals("ROLE_PATIENT")) {
            Patient patient = Patient.builder().user(user).build();
            patientRepository.save(patient);
        } else if (targetRoleName.equals("ROLE_DOCTOR")) {
            Doctor doctor = Doctor.builder().user(user).build();
            doctorRepository.save(doctor);
        }

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        auditService.log(user.getId(), "REGISTER", "User", user.getId().toString(), ipAddress, userAgent, null);

        return buildAuthResponse(accessToken, refreshToken, user, userDetails);
    }

    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshRequest request) {
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String userId = tokenProvider.getUserIdFromToken(request.getRefreshToken());
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.joining(","));

        String accessToken = tokenProvider.generateTokenFromUserId(
                userId, user.getEmail(), user.getFullName(), roles);

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(request.getRefreshToken())
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(mapUserInfo(user))
                .build();
    }

    @Transactional
    public void forgotPassword(AuthDto.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(ZonedDateTime.now().plusHours(1));
        userRepository.save(user);

        // In production: send email with reset link
        log.info("Password reset token for {}: {}", user.getEmail(), resetToken);
    }

    @Transactional
    public void resetPassword(AuthDto.ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(ZonedDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
    }

    private AuthDto.AuthResponse buildAuthResponse(String accessToken, String refreshToken,
                                                     User user, CustomUserDetails userDetails) {
        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(mapUserInfo(user))
                .build();
    }

    private AuthDto.UserInfo mapUserInfo(User user) {
        String role = user.getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElse("ROLE_PATIENT")
                .replace("ROLE_", "");

        return AuthDto.UserInfo.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(role)
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .build();
    }
}
