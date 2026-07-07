package com.cardiovision.api.controller;

import com.cardiovision.api.dto.AuthDto;
import com.cardiovision.api.entity.Role;
import com.cardiovision.api.repository.RoleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoleRepository roleRepository;

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
    void testRegisterEndpointSuccess() throws Exception {
        AuthDto.RegisterRequest request = AuthDto.RegisterRequest.builder()
                .email("ctrl.reg@cardiovision.ai")
                .password("SecurePass123!")
                .firstName("Controller")
                .lastName("Test")
                .phone("1112223333")
                .role("PATIENT")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.user.email").value("ctrl.reg@cardiovision.ai"));
    }

    @Test
    void testLoginEndpointSuccess() throws Exception {
        // First register
        AuthDto.RegisterRequest regRequest = AuthDto.RegisterRequest.builder()
                .email("ctrl.login@cardiovision.ai")
                .password("SecurePass123!")
                .firstName("Login")
                .lastName("Ctrl")
                .role("PATIENT")
                .build();
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isOk());

        // Now login
        AuthDto.LoginRequest loginRequest = AuthDto.LoginRequest.builder()
                .email("ctrl.login@cardiovision.ai")
                .password("SecurePass123!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    @Test
    void testRegisterDuplicateEmailReturns409() throws Exception {
        AuthDto.RegisterRequest request = AuthDto.RegisterRequest.builder()
                .email("dup.ctrl@cardiovision.ai")
                .password("SecurePass123!")
                .firstName("Dup")
                .lastName("Ctrl")
                .role("PATIENT")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("CONFLICT"));
    }

    @Test
    void testLoginInvalidPasswordReturns400() throws Exception {
        AuthDto.RegisterRequest regRequest = AuthDto.RegisterRequest.builder()
                .email("invalid.login@cardiovision.ai")
                .password("SecurePass123!")
                .firstName("Invalid")
                .lastName("Login")
                .role("PATIENT")
                .build();
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isOk());

        AuthDto.LoginRequest loginRequest = AuthDto.LoginRequest.builder()
                .email("invalid.login@cardiovision.ai")
                .password("WrongPassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"));
    }
}
