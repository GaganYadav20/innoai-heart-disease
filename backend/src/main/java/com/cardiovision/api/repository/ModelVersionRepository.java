package com.cardiovision.api.repository;

import com.cardiovision.api.entity.ModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelVersionRepository extends JpaRepository<ModelVersion, Long> {
    List<ModelVersion> findByIsActiveTrue();
    Optional<ModelVersion> findByModelNameAndVersion(String modelName, String version);
    List<ModelVersion> findByModelNameOrderByCreatedAtDesc(String modelName);
    Optional<ModelVersion> findByModelNameAndIsActiveTrue(String modelName);
}
