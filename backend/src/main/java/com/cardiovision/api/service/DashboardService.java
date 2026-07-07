package com.cardiovision.api.service;

import com.cardiovision.api.dto.DashboardDto;
import com.cardiovision.api.entity.*;
import com.cardiovision.api.exception.ResourceNotFoundException;
import com.cardiovision.api.repository.*;
import com.cardiovision.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PredictionRepository predictionRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public DashboardDto.Summary getSummary() {
        ZonedDateTime todayStart = ZonedDateTime.now().withHour(0).withMinute(0).withSecond(0);

        return DashboardDto.Summary.builder()
                .totalPredictions(predictionRepository.countCompletedPredictions())
                .todayReports(reportRepository.countReportsSince(todayStart))
                .highRiskPatients(predictionRepository.countByRiskCategory("HIGH") +
                        predictionRepository.countByRiskCategory("CRITICAL"))
                .averageHeartAge(Optional.ofNullable(predictionRepository.averageHeartAge()).orElse(0.0))
                .totalUsers(userRepository.count())
                .totalDoctors(userRepository.countByRoleName("ROLE_DOCTOR"))
                .totalPatients(userRepository.countByRoleName("ROLE_PATIENT"))
                .build();
    }

    public DashboardDto.ChartData getChartData() {
        Map<String, Long> riskDistribution = new LinkedHashMap<>();
        riskDistribution.put("LOW", predictionRepository.countByRiskCategory("LOW"));
        riskDistribution.put("MODERATE", predictionRepository.countByRiskCategory("MODERATE"));
        riskDistribution.put("HIGH", predictionRepository.countByRiskCategory("HIGH"));
        riskDistribution.put("CRITICAL", predictionRepository.countByRiskCategory("CRITICAL"));

        return DashboardDto.ChartData.builder()
                .riskDistribution(riskDistribution)
                .predictionTrend(new ArrayList<>())
                .topRiskFactors(List.of(
                    DashboardDto.FeatureImportance.builder().feature("Age").importance(0.18).build(),
                    DashboardDto.FeatureImportance.builder().feature("Cholesterol").importance(0.15).build(),
                    DashboardDto.FeatureImportance.builder().feature("Max Heart Rate").importance(0.14).build(),
                    DashboardDto.FeatureImportance.builder().feature("Chest Pain Type").importance(0.12).build(),
                    DashboardDto.FeatureImportance.builder().feature("Oldpeak").importance(0.10).build()
                ))
                .build();
    }

    public DashboardDto.UserProfile getProfile() {
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DashboardDto.UserProfile.UserProfileBuilder builder = DashboardDto.UserProfile.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .createdAt(user.getCreatedAt());

        String role = user.getRoles().stream()
                .map(Role::getName).findFirst().orElse("ROLE_PATIENT").replace("ROLE_", "");
        builder.role(role);

        // Add patient-specific info
        patientRepository.findByUserId(user.getId()).ifPresent(patient -> {
            builder.dateOfBirth(patient.getDateOfBirth())
                    .gender(patient.getGender())
                    .bloodGroup(patient.getBloodGroup())
                    .heightCm(patient.getHeightCm())
                    .weightKg(patient.getWeightKg())
                    .emergencyContact(patient.getEmergencyContact())
                    .emergencyPhone(patient.getEmergencyPhone())
                    .allergies(patient.getAllergies());
        });

        // Add doctor-specific info
        doctorRepository.findByUserId(user.getId()).ifPresent(doctor -> {
            builder.specialization(doctor.getSpecialization())
                    .licenseNumber(doctor.getLicenseNumber())
                    .hospital(doctor.getHospital())
                    .department(doctor.getDepartment())
                    .experienceYears(doctor.getExperienceYears());
        });

        return builder.build();
    }

    @Transactional
    public DashboardDto.UserProfile updateProfile(DashboardDto.UpdateProfileRequest request) {
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);

        // Update patient profile
        patientRepository.findByUserId(user.getId()).ifPresent(patient -> {
            if (request.getDateOfBirth() != null) patient.setDateOfBirth(request.getDateOfBirth());
            if (request.getGender() != null) patient.setGender(request.getGender());
            if (request.getBloodGroup() != null) patient.setBloodGroup(request.getBloodGroup());
            if (request.getHeightCm() != null) patient.setHeightCm(request.getHeightCm());
            if (request.getWeightKg() != null) patient.setWeightKg(request.getWeightKg());
            if (request.getEmergencyContact() != null) patient.setEmergencyContact(request.getEmergencyContact());
            if (request.getEmergencyPhone() != null) patient.setEmergencyPhone(request.getEmergencyPhone());
            if (request.getAllergies() != null) patient.setAllergies(request.getAllergies());
            patientRepository.save(patient);
        });

        // Update doctor profile
        doctorRepository.findByUserId(user.getId()).ifPresent(doctor -> {
            if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
            if (request.getHospital() != null) doctor.setHospital(request.getHospital());
            if (request.getDepartment() != null) doctor.setDepartment(request.getDepartment());
            if (request.getExperienceYears() != null) doctor.setExperienceYears(request.getExperienceYears());
            doctorRepository.save(doctor);
        });

        return getProfile();
    }

    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new com.cardiovision.api.exception.BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
