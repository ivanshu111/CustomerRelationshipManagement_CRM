package com.sunbeam.CRM.service;

import com.sunbeam.CRM.dto.NotificationResponseDto;

import java.util.List;

public interface NotificationService {
    List<NotificationResponseDto> getMyNotifications();

    long getUnreadCount();
}
