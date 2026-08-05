package com.sunbeam.CRM.controller;

import com.sunbeam.CRM.dto.NotificationResponseDto;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.UserRepository;
import com.sunbeam.CRM.security.UserDetailsImpl;
import com.sunbeam.CRM.service.NotificationService;
import com.sunbeam.CRM.service.impl.SseNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationSseController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final SseNotificationService sseNotificationService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {

        UserDetailsImpl user = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return sseNotificationService.createConnection(user.getId());
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications() {
        return ResponseEntity.ok(notificationService.getMyNotifications());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadCount());
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Integer notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok("Notification marked as read");
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<String> markAllAsRead() {notificationService.markAllAsRead();
        return ResponseEntity.ok("All notifications marked as read");
    }

}
