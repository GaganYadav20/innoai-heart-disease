package com.cardiovision.api.repository;

import com.cardiovision.api.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
    Optional<Doctor> findByLicenseNumber(String licenseNumber);
}
