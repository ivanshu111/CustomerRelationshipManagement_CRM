package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.dto.NotificationResponseDto;
import com.sunbeam.CRM.entities.NotificationType;
import com.sunbeam.CRM.entities.Notifications;
import com.sunbeam.CRM.entities.Role;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.NotificationRepository;
import com.sunbeam.CRM.repository.UserRepository;
import com.sunbeam.CRM.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ModelMapper mapper;
    private final SseNotificationService sseNotificationService;
    @Override
    public List<NotificationResponseDto> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notifications> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(loggedInUser);

        return notifications.stream()
                .map(not -> mapper.map(not, NotificationResponseDto.class))
                .collect(toList());
    }

    @Override
    public long getUnreadCount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.countByRecipientAndIsReadFalse(loggedInUser);
    }

    @Transactional
    @Override
    public void markAsRead(Integer notificationId) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notifications notification = notificationRepository.findByIdAndRecipient(notificationId, loggedInUser)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    @Transactional
    @Override
    public void markAllAsRead() {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notifications> notifications = notificationRepository.findByRecipientAndIsReadFalse(loggedInUser);
        notifications.forEach(notification -> notification.setRead(true));

        notificationRepository.saveAll(notifications);
    }

    @Transactional
    @Override
    public void createNotification(Users recipient,String title, String message, NotificationType type) {

        Notifications notification = new Notifications();

        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notifications savedNotification = notificationRepository.save(notification);
        NotificationResponseDto notificationDto = mapper.map(savedNotification, NotificationResponseDto.class);

        // Send real-time notification
        sseNotificationService.sendNotification(recipient.getId(), notificationDto);
    }

    @Transactional
    @Override
    public void notifyAllAdmins(String title, String message, NotificationType type) {

        List<Users> admins = userRepository.findByRole(Role.ADMIN);
        for (Users admin : admins) {
            System.out.println("Notifying Admin -> ID: " + admin.getId() + ", Name: " + admin.getName());
            createNotification(admin, title, message, type);
        }
    }

    @Override
    @Transactional
    public void deleteNotificationsOlderThanDays(int days) {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);

        notificationRepository.deleteByCreatedAtBefore(cutoff);
    }
}
