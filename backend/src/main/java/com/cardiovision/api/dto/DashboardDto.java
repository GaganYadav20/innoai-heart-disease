package com.cardiovision.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

public class DashboardDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Summary {
        private long totalPredictions;
        private long todayReports;
        private long highRiskPatients;
        private double averageHeartAge;
        private long totalUsers;
        private long totalDoctors;
        private long totalPatients;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChartData {
        private List<PredictionTrend> predictionTrend;
        private Map<String, Long> riskDistribution;
        private List<FeatureImportance> topRiskFactors;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PredictionTrend {
        private String date;
        private long count;
        private double avgRisk;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FeatureImportance {
        private String feature;
        private double importance;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReportSummary {
        private String id;
        private String title;
        private String fileName;
        private String patientName;
        private String riskCategory;
        private BigDecimal riskScore;
        private ZonedDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserProfile {
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String avatarUrl;
        private String role;
        private boolean emailVerified;
        private LocalDate dateOfBirth;
        private String gender;
        private String bloodGroup;
        private BigDecimal heightCm;
        private BigDecimal weightKg;
        private String emergencyContact;
        private String emergencyPhone;
        private String allergies;
        private ZonedDateTime createdAt;
        // Doctor-specific
        private String specialization;
        private String licenseNumber;
        private String hospital;
        private String department;
        private Integer experienceYears;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String bloodGroup;
        private BigDecimal heightCm;
        private BigDecimal weightKg;
        private String emergencyContact;
        private String emergencyPhone;
        private String allergies;
        // Doctor-specific
        private String specialization;
        private String hospital;
        private String department;
        private Integer experienceYears;
    }
}
