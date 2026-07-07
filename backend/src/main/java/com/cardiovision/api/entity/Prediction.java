package com.cardiovision.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "predictions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    @Column(name = "model_version", nullable = false)
    private String modelVersion;

    @Column(name = "risk_score", nullable = false)
    private BigDecimal riskScore;

    @Column(name = "risk_category", nullable = false)
    private String riskCategory;

    @Column(name = "confidence_score")
    private BigDecimal confidenceScore;

    @Column(name = "heart_age")
    private Integer heartAge;

    @Column(name = "prediction_time_ms")
    private Long predictionTimeMs;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "shap_values", columnDefinition = "jsonb")
    private Map<String, Object> shapValues;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "lime_values", columnDefinition = "jsonb")
    private Map<String, Object> limeValues;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "feature_importance", columnDefinition = "jsonb")
    private Map<String, Object> featureImportance;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_features", columnDefinition = "jsonb")
    private Map<String, Object> inputFeatures;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations", columnDefinition = "jsonb")
    private List<Map<String, Object>> recommendations;

    @Builder.Default
    private String status = "COMPLETED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
