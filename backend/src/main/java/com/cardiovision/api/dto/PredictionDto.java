package com.cardiovision.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

public class PredictionDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PredictRequest {
        private String reportId;
        private String modelName;
        private Map<String, Object> features;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PredictResponse {
        private String id;
        private String reportId;
        private String modelName;
        private String modelVersion;
        private BigDecimal riskScore;
        private String riskCategory;
        private BigDecimal confidenceScore;
        private Integer heartAge;
        private Long predictionTimeMs;
        private Map<String, Object> shapValues;
        private Map<String, Object> limeValues;
        private Map<String, Object> featureImportance;
        private Map<String, Object> inputFeatures;
        private List<Map<String, Object>> recommendations;
        private ZonedDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class AiPredictRequest {
        private Map<String, Object> features;
        private String modelName;
        private boolean explain;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class AiPredictResponse {
        private double riskScore;
        private String riskCategory;
        private double confidenceScore;
        private int heartAge;
        private long predictionTimeMs;
        private String modelName;
        private String modelVersion;
        private Map<String, Object> shapValues;
        private Map<String, Object> limeValues;
        private Map<String, Object> featureImportance;
        private List<Map<String, Object>> recommendations;
    }
}
