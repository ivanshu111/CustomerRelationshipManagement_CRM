package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.dto.EmailRequestDto;
import com.sunbeam.CRM.dto.EmailResponseDto;

import com.sunbeam.CRM.exception.EmailSendingException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class EmailClientService {

    @Qualifier("emailRestClient")
    private final RestClient restClient;

    @Value("${email.service.api-key}")
    private String apiKey;

    public EmailClientService(
            @Qualifier("emailRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

//    Java Mail Sender
//    public void sendEmail(EmailRequest request) {
//
//        restClient.post()
//                .uri("/api/Email/send")
//                .body(request)
//                .retrieve()
//                .toBodilessEntity();
//    }

    public EmailResponseDto sendEmail(EmailRequestDto request) {

        try {
            return restClient.post()
                    .uri("/api/Email/send")
                    .header("X-API-Key", apiKey)
                    .body(request)
                    .retrieve()
                    .body(EmailResponseDto.class);

        } catch (Exception ex) {
            throw new EmailSendingException(
                    "Unable to communicate with the Email Service.",
                    ex
            );
        }
    }
}