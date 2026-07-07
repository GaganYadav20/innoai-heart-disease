package com.cardiovision.api.repository;

import com.cardiovision.api.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status, Pageable pageable);
    long countByUserIdAndIsReadFalse(UUID userId);
}
