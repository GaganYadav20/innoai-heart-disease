package com.cardiovision.api.repository;

import com.cardiovision.api.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    Page<Report> findByPatientIdAndStatus(UUID patientId, String status, Pageable pageable);

    Page<Report> findByDoctorIdAndStatus(UUID doctorId, String status, Pageable pageable);

    Page<Report> findByCreatedByIdAndStatus(UUID userId, String status, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = 'ACTIVE'")
    long countActiveReports();

    @Query("SELECT COUNT(r) FROM Report r WHERE r.createdAt >= :since AND r.status = 'ACTIVE'")
    long countReportsSince(ZonedDateTime since);
}
