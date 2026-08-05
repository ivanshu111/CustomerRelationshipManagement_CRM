package com.sunbeam.CRM.service.impl;


import com.sunbeam.CRM.entities.Interaction;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.InteractionRepository;
import com.sunbeam.CRM.service.EmailService;
import com.sunbeam.CRM.service.FollowUpReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowUpReminderServiceImpl implements FollowUpReminderService {

    private final InteractionRepository interactionRepository;
    private final EmailService emailService;

    public void sendTodayFollowUpReminders() {

        // 1. Get today's date
        LocalDate today = LocalDate.now();

        // 2. Fetch today's follow-ups
        List<Interaction> interactions =
                interactionRepository.findByNextFollowUpDate(today);

        // 3. Nothing to send
        if (interactions.isEmpty()) {
            return;
        }

        // 4. Group by employee
        Map<Users, List<Interaction>> groupedInteractions =
                interactions.stream()
                        .collect(Collectors.groupingBy(Interaction::getEmployee));

        // 5. Send one email to each employee
        for (Map.Entry<Users, List<Interaction>> entry : groupedInteractions.entrySet()) {

            Users employee = entry.getKey();
            List<Interaction> employeeInteractions = entry.getValue();

            emailService.sendTodayFollowUpReminder(employee, employeeInteractions);
        }
    }
}
