package com.sunbeam.CRM.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sunbeam.CRM.dto.InteractionRequestDto;
import com.sunbeam.CRM.dto.InteractionResponseDto;
import com.sunbeam.CRM.service.InteractionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/interaction")
@RequiredArgsConstructor


public class InteractionController {
    
    private final InteractionService interactionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> createInteraction(@RequestBody InteractionRequestDto dto) {
        interactionService.createInteraction(dto);
        return ResponseEntity.ok("Interaction created successfully...!");
    }

    @GetMapping("/customer/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getCustomerInteractions(@PathVariable Integer id){
        List<InteractionResponseDto> response = interactionService.getCustomerInteractions(id);
        return ResponseEntity.ok(response);
    }
}
