package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.Notifications;
import com.sunbeam.CRM.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notifications, Integer> {
    List<Notifications> findByRecipientOrderByCreatedAtDesc(Users recipient);

    long countByRecipientAndIsReadFalse(Users loggedInUser);
}
