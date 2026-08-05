package com.sunbeam.CRM.service;

import com.sunbeam.CRM.dto.NotificationResponseDto;
import com.sunbeam.CRM.entities.NotificationType;
import com.sunbeam.CRM.entities.Users;

import java.util.List;

public interface NotificationService {
    List<NotificationResponseDto> getMyNotifications();

    long getUnreadCount();

    void markAsRead(Integer notificationId);

    void markAllAsRead();

    void createNotification(Users oldOwner, String oldOwnerTitle, String oldOwnerMessage, NotificationType notificationType);

    void notifyAllAdmins(String title, String message, NotificationType type);
}
