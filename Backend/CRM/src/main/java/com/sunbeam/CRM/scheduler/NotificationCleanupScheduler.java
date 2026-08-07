package com.sunbeam.CRM.scheduler;

import com.sunbeam.CRM.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationCleanupScheduler {

    private final NotificationService notificationService;

    @Scheduled(cron = "${crm.notification.cleanup.cron}")
    public void cleanupNotifications() {

        notificationService.deleteNotificationsOlderThanDays(7);
    }
}