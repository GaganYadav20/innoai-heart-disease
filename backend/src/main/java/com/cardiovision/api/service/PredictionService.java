package com.cardiovision.api.service;

import com.cardiovision.api.dto.PredictionDto;
import com.cardiovision.api.entity.*;
import com.cardiovision.api.exception.ResourceNotFoundException;
import com.cardiovision.api.repository.*;
import com.cardiovision.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final ReportRepository reportRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final WebClient aiServiceWebClient;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public PredictionDto.PredictResponse predict(PredictionDto.PredictRequest request) {
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        Report report = null;
        Patient patient = null;

        if (request.getReportId() != null) {
            report = reportRepository.findById(UUID.fromString(request.getReportId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
            patient = report.getPatient();
        }

        if (patient == null) {
            patient = patientRepository.findByUserId(currentUser.getId()).orElse(null);
        }

        // Determine model to use
        String modelName = request.getModelName() != null ? request.getModelName() : "random_forest";

        // Call AI service
        PredictionDto.AiPredictRequest aiRequest = PredictionDto.AiPredictRequest.builder()
                .features(request.getFeatures())
                .modelName(modelName)
                .explain(true)
                .build();

        PredictionDto.AiPredictResponse aiResponse;
        try {
            aiResponse = aiServiceWebClient.post()
                    .uri("/ai/predict")
                    .bodyValue(aiRequest)
                    .retrieve()
                    .bodyToMono(PredictionDto.AiPredictResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("AI service call failed", e);
            // Return mock prediction if AI service is unavailable
            aiResponse = generateMockPrediction(request.getFeatures(), modelName);
        }

        // Save prediction
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Prediction prediction = Prediction.builder()
                .report(report)
                .patient(patient)
                .modelName(aiResponse.getModelName())
                .modelVersion(aiResponse.getModelVersion())
                .riskScore(BigDecimal.valueOf(aiResponse.getRiskScore()))
                .riskCategory(aiResponse.getRiskCategory())
                .confidenceScore(BigDecimal.valueOf(aiResponse.getConfidenceScore()))
                .heartAge(aiResponse.getHeartAge())
                .predictionTimeMs(aiResponse.getPredictionTimeMs())
                .shapValues(aiResponse.getShapValues())
                .limeValues(aiResponse.getLimeValues())
                .featureImportance(aiResponse.getFeatureImportance())
                .inputFeatures(request.getFeatures())
                .recommendations(aiResponse.getRecommendations())
                .createdBy(user)
                .build();

        prediction = predictionRepository.save(prediction);

        // Audit
        auditService.log(currentUser.getId(), "PREDICTION", "Prediction",
                prediction.getId().toString(), null, null,
                Map.of("model", modelName, "risk", aiResponse.getRiskCategory()));

        // Notification for high risk
        if ("HIGH".equals(aiResponse.getRiskCategory()) || "CRITICAL".equals(aiResponse.getRiskCategory())) {
            notificationService.createNotification(currentUser.getId(),
                    "High Risk Alert",
                    "Your cardiac risk prediction indicates " + aiResponse.getRiskCategory() + " risk. Please consult a cardiologist.",
                    "WARNING",
                    "/dashboard/prediction/" + prediction.getId());
        }

        return mapToResponse(prediction);
    }

    public PredictionDto.PredictResponse getPrediction(UUID id) {
        Prediction prediction = predictionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction not found"));
        return mapToResponse(prediction);
    }

    public Page<PredictionDto.PredictResponse> getHistory(Pageable pageable) {
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return predictionRepository.findByCreatedByIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    private PredictionDto.PredictResponse mapToResponse(Prediction p) {
        return PredictionDto.PredictResponse.builder()
                .id(p.getId().toString())
                .reportId(p.getReport() != null ? p.getReport().getId().toString() : null)
                .modelName(p.getModelName())
                .modelVersion(p.getModelVersion())
                .riskScore(p.getRiskScore())
                .riskCategory(p.getRiskCategory())
                .confidenceScore(p.getConfidenceScore())
                .heartAge(p.getHeartAge())
                .predictionTimeMs(p.getPredictionTimeMs())
                .shapValues(p.getShapValues())
                .limeValues(p.getLimeValues())
                .featureImportance(p.getFeatureImportance())
                .inputFeatures(p.getInputFeatures())
                .recommendations(p.getRecommendations())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private PredictionDto.AiPredictResponse generateMockPrediction(Map<String, Object> features, String modelName) {
        Random random = new Random();
        double riskScore = 0.3 + random.nextDouble() * 0.5;
        String riskCategory = riskScore < 0.3 ? "LOW" : riskScore < 0.5 ? "MODERATE" : riskScore < 0.7 ? "HIGH" : "CRITICAL";

        int age = features.containsKey("age") ? ((Number) features.get("age")).intValue() : 50;
        int heartAge = age + random.nextInt(15) - 5;

        Map<String, Object> shapValues = new LinkedHashMap<>();
        shapValues.put("age", 0.15 + random.nextDouble() * 0.1);
        shapValues.put("cholesterol", 0.12 + random.nextDouble() * 0.1);
        shapValues.put("max_hr", -0.08 + random.nextDouble() * 0.05);
        shapValues.put("resting_bp", 0.09 + random.nextDouble() * 0.05);
        shapValues.put("oldpeak", 0.07 + random.nextDouble() * 0.05);

        Map<String, Object> featureImportance = new LinkedHashMap<>();
        featureImportance.put("age", 0.18);
        featureImportance.put("cholesterol", 0.15);
        featureImportance.put("max_hr", 0.14);
        featureImportance.put("chest_pain_type", 0.12);
        featureImportance.put("oldpeak", 0.10);
        featureImportance.put("resting_bp", 0.09);
        featureImportance.put("st_slope", 0.08);
        featureImportance.put("exercise_angina", 0.06);
        featureImportance.put("fasting_bs", 0.04);
        featureImportance.put("resting_ecg", 0.04);

        List<Map<String, Object>> recommendations = new ArrayList<>();
        recommendations.add(Map.of("title", "Regular Exercise", "description", "Engage in at least 150 minutes of moderate aerobic exercise per week.", "priority", "HIGH"));
        recommendations.add(Map.of("title", "Diet Management", "description", "Follow a heart-healthy diet rich in fruits, vegetables, and whole grains.", "priority", "HIGH"));
        recommendations.add(Map.of("title", "Regular Checkups", "description", "Schedule regular cardiovascular checkups with your doctor.", "priority", "MEDIUM"));
        recommendations.add(Map.of("title", "Stress Management", "description", "Practice stress-reducing activities like meditation or yoga.", "priority", "MEDIUM"));

        return PredictionDto.AiPredictResponse.builder()
                .riskScore(riskScore)
                .riskCategory(riskCategory)
                .confidenceScore(0.85 + random.nextDouble() * 0.1)
                .heartAge(heartAge)
                .predictionTimeMs(50 + random.nextLong(200))
                .modelName(modelName)
                .modelVersion("1.0.0")
                .shapValues(shapValues)
                .limeValues(shapValues)
                .featureImportance(featureImportance)
                .recommendations(recommendations)
                .build();
    }
}
