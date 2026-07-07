package com.cardiovision.api.service;

import com.cardiovision.api.entity.Report;
import com.cardiovision.api.entity.Patient;
import com.cardiovision.api.entity.User;
import com.cardiovision.api.exception.BadRequestException;
import com.cardiovision.api.exception.ResourceNotFoundException;
import com.cardiovision.api.repository.PatientRepository;
import com.cardiovision.api.repository.ReportRepository;
import com.cardiovision.api.repository.UserRepository;
import com.cardiovision.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf", "image/png", "image/jpeg", "image/tiff"
    );

    @Transactional
    public Report uploadReport(MultipartFile file, String title, String notes) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Unsupported file type. Allowed: PDF, PNG, JPEG, TIFF");
        }

        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Patient patient = patientRepository.findByUserId(currentUser.getId()).orElse(null);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".pdf";
        String storedFilename = UUID.randomUUID() + extension;

        // Create upload directory
        Path uploadPath = Paths.get(uploadDir, currentUser.getId().toString());
        try {
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new BadRequestException("Failed to upload file");
        }

        Report report = Report.builder()
                .patient(patient)
                .title(title != null ? title : originalFilename)
                .fileName(originalFilename)
                .filePath(uploadPath.resolve(storedFilename).toString())
                .fileType(contentType)
                .fileSize(file.getSize())
                .notes(notes)
                .createdBy(user)
                .build();

        report = reportRepository.save(report);

        auditService.log(currentUser.getId(), "UPLOAD_REPORT", "Report",
                report.getId().toString(), null, null, Map.of("fileName", originalFilename));

        return report;
    }

    public Page<Report> getReports(Pageable pageable) {
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return reportRepository.findByCreatedByIdAndStatus(currentUser.getId(), "ACTIVE", pageable);
    }

    public Report getReport(UUID id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    }

    @Transactional
    public void deleteReport(UUID id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        report.setStatus("DELETED");
        reportRepository.save(report);

        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        auditService.log(currentUser.getId(), "DELETE_REPORT", "Report",
                id.toString(), null, null, null);
    }

    public byte[] downloadReport(UUID id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        try {
            return Files.readAllBytes(Paths.get(report.getFilePath()));
        } catch (IOException e) {
            throw new ResourceNotFoundException("Report file not found on disk");
        }
    }
}
