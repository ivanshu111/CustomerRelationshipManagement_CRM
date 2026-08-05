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
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        emitters.put(userId, emitter);
        emitter.onCompletion(() -> emitters.remove(userId));

        emitter.onTimeout(() -> {emitter.complete();emitters.remove(userId);});

        // Remove connection when an error occurs
        emitter.onError((error) -> emitters.remove(userId));

        try {
            // Send initial event so browser knows connection is active
            emitter.send(SseEmitter.event().name("connected").data("SSE connection established")
            );
        } catch (IOException e) {
            emitters.remove(userId);
            emitter.completeWithError(e);
        }

        return emitter;
    }

    public void sendNotification(Integer userId, Object notification) {

        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) {
            return;
        }

        try {
            emitter.send(SseEmitter.event().name("notification").data(notification));
        } catch (IOException e) {
            emitters.remove(userId);
            emitter.completeWithError(e);
        }
    }
}