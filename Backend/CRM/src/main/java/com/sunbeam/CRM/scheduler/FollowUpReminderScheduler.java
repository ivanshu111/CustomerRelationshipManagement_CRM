package com.sunbeam.CRM.scheduler;


import com.sunbeam.CRM.service.FollowUpReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FollowUpReminderScheduler {

    private final FollowUpReminderService followUpReminderService;

    @Scheduled(cron = "${crm.followup.scheduler.cron}",zone = "Asia/Kolkata")
    public void sendDailyFollowUpReminders() {
        followUpReminderService.sendTodayFollowUpReminders();
    }
}