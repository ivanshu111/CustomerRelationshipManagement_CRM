package com.sunbeam.CRM.dto;

import com.sunbeam.CRM.entities.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {

    private Integer id;

    private String title;

    private String message;

    private NotificationType type;

    private boolean isRead;

    private LocalDateTime createdAt;
}