package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.Notifications;
import com.sunbeam.CRM.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notifications, Integer> {
    List<Notifications> findByRecipientOrderByCreatedAtDesc(Users recipient);

    long countByRecipientAndIsReadFalse(Users loggedInUser);

    List<Notifications> findByRecipientAndIsReadFalse(Users recipient);

    Optional<Notifications> findByIdAndRecipient(Integer notificationId, Users loggedInUser);

    void deleteByCreatedAtBefore(LocalDateTime dateTime);
}
