package com.cardiovision.api.repository;

import com.cardiovision.api.entity.Prediction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, UUID> {

    Page<Prediction> findByPatientIdOrderByCreatedAtDesc(UUID patientId, Pageable pageable);

    Page<Prediction> findByCreatedByIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Prediction> findByReportId(UUID reportId);

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.status = 'COMPLETED'")
    long countCompletedPredictions();

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.createdAt >= :since")
    long countPredictionsSince(ZonedDateTime since);

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.riskCategory = :category")
    long countByRiskCategory(String category);

    @Query("SELECT p FROM Prediction p WHERE p.patient.id = :patientId ORDER BY p.createdAt DESC")
    List<Prediction> findLatestByPatientId(UUID patientId, Pageable pageable);

    @Query("SELECT AVG(p.heartAge) FROM Prediction p WHERE p.heartAge IS NOT NULL")
    Double averageHeartAge();
}
