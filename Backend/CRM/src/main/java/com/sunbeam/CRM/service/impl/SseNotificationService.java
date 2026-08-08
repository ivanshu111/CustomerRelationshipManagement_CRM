package com.sunbeam.CRM.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class SseNotificationService {

    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter createConnection(Integer userId) {

        System.out.println("SSE CONNECTED for user: " + userId);

        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.put(userId, emitter);

        System.out.println("Active SSE connections: " + emitters.keySet());

        emitter.onCompletion(() -> {
            System.out.println("SSE COMPLETED for user: " + userId);
            emitters.remove(userId);
        });

        emitter.onTimeout(() -> {
            System.out.println("SSE TIMEOUT for user: " + userId);
            emitters.remove(userId);
            emitter.complete();
        });

        emitter.onError((error) -> {
            System.out.println("SSE ERROR for user " + userId + ": " + error);
            emitters.remove(userId);
        });

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("connected")
                            .data("SSE connection established")
            );

            System.out.println("Initial SSE event sent to user: " + userId);

        } catch (IOException e) {
            System.out.println("Failed to establish SSE for user: " + userId);
            emitters.remove(userId);
            emitter.completeWithError(e);
        }

        return emitter;
    }

    public void sendNotification(Integer userId, Object notification) {

        System.out.println("Trying to send notification to user: " + userId);
        System.out.println("Active SSE connections: " + emitters.keySet());

        SseEmitter emitter = emitters.get(userId);

        if (emitter == null) {
            System.out.println("NO SSE CONNECTION for user: " + userId);
            return;
        }

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("notification")
                            .data(notification)
            );

            System.out.println("NOTIFICATION SENT to user: " + userId);

        } catch (IOException e) {
            System.out.println("SSE SEND ERROR for user: " + userId);
            emitters.remove(userId);
            emitter.completeWithError(e);
        }
    }
}