package com.cardiovision.api.service;

import com.cardiovision.api.dto.AuthDto;
import com.cardiovision.api.entity.Role;
import com.cardiovision.api.exception.BadRequestException;
import com.cardiovision.api.exception.DuplicateResourceException;
import com.cardiovision.api.repository.RoleRepository;
import com.cardiovision.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        if (roleRepository.findByName("ROLE_PATIENT").isEmpty()) {
            roleRepository.save(Role.builder().name("ROLE_PATIENT").description("Patient Role").build());
        }
        if (roleRepository.findByName("ROLE_DOCTOR").isEmpty()) {
            roleRepository.save(Role.builder().name("ROLE_DOCTOR").description("Doctor Role").build());
        }
    }

    @Test
    void testRegisterPatientSuccess() {
        AuthDto.RegisterRequest request = AuthDto.RegisterRequest.builder()
                .email("patient.test@cardiovision.ai")
                .password("SecurePass123!")
                .firstName("John")
                .lastName("Doe")
                .phone("1234567890")
                .role("PATIENT")
                .build();

        AuthDto.AuthResponse response = authService.register(request, "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("patient.test@cardiovision.ai", response.getUser().getEmail());
        assertEquals("PATIENT", response.getUser().getRole());
        assertTrue(userRepository.existsByEmail("patient.test@cardiovision.ai"));
    }

    @Test
    void testRegisterDoctorSuccess() {
        AuthDto.RegisterRequest request = AuthDto.RegisterRequest.builder()
                .email("doctor.test@cardiovision.ai")
                .password("SecurePass123!")
                .firstName("Sarah")
                .lastName("Smith")
                .phone("0987654321")
                .role("DOCTOR")
                .build();

        AuthDto.AuthResponse response = authService.register(request, "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("doctor.test@cardiovision.ai", response.getUser().getEmail());
        assertEquals("DOCTOR", response.getUser().getRole());
    }

    @Test
    void testRegisterDuplicateEmailThrowsException() {
        AuthDto.RegisterRequest request = AuthDto.RegisterRequest.builder()
                .email("duplicate@cardiovision.ai")
                .password("SecurePass123!")
                .firstName("Jane")
                .lastName("Doe")
                .role("PATIENT")
                .build();

        authService.register(request, "127.0.0.1", "JUnit");

        assertThrows(DuplicateResourceException.class, () -> {
            authService.register(request, "127.0.0.1", "JUnit");
        });
    }

    @Test
    void testLoginSuccess() {
        AuthDto.RegisterRequest regRequest = AuthDto.RegisterRequest.builder()
                .email("login.test@cardiovision.ai")
                .password("SecurePass123!")
                .firstName("Login")
                .lastName("User")
                .role("PATIENT")
                .build();
        authService.register(regRequest, "127.0.0.1", "JUnit");

        AuthDto.LoginRequest loginRequest = AuthDto.LoginRequest.builder()
                .email("login.test@cardiovision.ai")
                .password("SecurePass123!")
                .build();

        AuthDto.AuthResponse response = authService.login(loginRequest, "127.0.0.1", "JUnit");
        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertEquals("login.test@cardiovision.ai", response.getUser().getEmail());
    }

    @Test
    void testLoginInvalidPasswordThrowsException() {
        AuthDto.RegisterRequest regRequest = AuthDto.RegisterRequest.builder()
                .email("wrongpass@cardiovision.ai")
                .password("SecurePass123!")
                .firstName("Wrong")
                .lastName("Pass")
                .role("PATIENT")
                .build();
        authService.register(regRequest, "127.0.0.1", "JUnit");

        AuthDto.LoginRequest loginRequest = AuthDto.LoginRequest.builder()
                .email("wrongpass@cardiovision.ai")
                .password("WrongPassword")
                .build();

        assertThrows(BadRequestException.class, () -> {
            authService.login(loginRequest, "127.0.0.1", "JUnit");
        });
    }
}
