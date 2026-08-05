package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.dto.EmailRequestDto;
import com.sunbeam.CRM.dto.EmailResponseDto;
import com.sunbeam.CRM.entities.Customers;
import com.sunbeam.CRM.entities.Interaction;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.exception.EmailSendingException;
import com.sunbeam.CRM.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    //    private final JavaMailSender mailSender;
    private final EmailClientService emailClientService;
    private final TemplateEngine templateEngine;

//    @Value("${spring.mail.username}")
//    private String fromEmail;

    @Override
    public void sendCustomerReassignmentEmail(Customers customer, Users oldOwner, Users newOwner) {

//        try {

        Context context = new Context();
        context.setVariable("newOwnerName", newOwner.getName());
        context.setVariable("oldOwnerName",
                oldOwner != null ? oldOwner.getName() : null);
        context.setVariable("customerName", customer.getName());
        context.setVariable("customerEmail", customer.getEmail());
        context.setVariable("customerPhone", customer.getPhone());

        String html = templateEngine.process(
                "customer-reassigned",
                context
        );

//            MimeMessage message = mailSender.createMimeMessage();
//
//            MimeMessageHelper helper =
//                    new MimeMessageHelper(message, true, "UTF-8");
//
//            helper.setFrom(fromEmail);
//            helper.setTo(newOwner.getEmail());
//            helper.setSubject("New Customer Assigned");
//            helper.setText(html, true);
//
//            mailSender.send(message);
//        }
//        catch (MessagingException ex) {
//            throw new EmailSendingException(
//                    "Unable to send customer reassignment email.",
//                    ex
//            );
//        }

        sendHtmlEmail(
                newOwner.getEmail(),
                "New Customer Assigned",
                html
        );

    }

    @Override
    public void sendTodayFollowUpReminder(Users employee, List<Interaction> employeeInteractions) {

//        try {

        Context context = new Context();
        context.setVariable("employeeName", employee.getName());
        context.setVariable("followUps", employeeInteractions);
        context.setVariable("today", LocalDate.now());

        String html = templateEngine.process(
                "today-followups",
                context
        );

//            MimeMessage message = mailSender.createMimeMessage();
//
//            MimeMessageHelper helper =
//                    new MimeMessageHelper(message, true, "UTF-8");
//
//            helper.setFrom(fromEmail);
//            System.out.println(employee.getEmail());
//            helper.setTo(employee.getEmail());
//            helper.setSubject("Today's Customer Follow-ups");
//            helper.setText(html, true);
//
//            mailSender.send(message);
//        }
//        catch (MessagingException ex) {
//            throw new EmailSendingException(
//                    "Unable to send customer reassignment email.",
//                    ex
//            );
//        }
        sendHtmlEmail(
                employee.getEmail(),
                "Today's Customer Follow-ups",
                html
        );
    }





    private void sendHtmlEmail(String to, String subject, String html) {

        EmailRequestDto request = new EmailRequestDto();
        request.setTo(to);
        request.setSubject(subject);
        request.setBody(html);
        request.setHtml(true);

        EmailResponseDto response = emailClientService.sendEmail(request);

        if (response == null || !response.isSuccess()) {
            throw new EmailSendingException(
                    response != null
                            ? response.getMessage()
                            : "Unable to send email."
            );
        }
    }
}