package com.sunbeam.CRM.controller;

import com.sunbeam.CRM.dto.ApplicantRegistrationRequestDto;
import com.sunbeam.CRM.service.RecruitmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruitment")
@RequiredArgsConstructor
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    @PostMapping("/register")
    public ResponseEntity<?> registerApplicant(
            @Valid @RequestBody ApplicantRegistrationRequestDto request) {

        recruitmentService.registerApplicant(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Application submitted successfully.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/applicants")
    public ResponseEntity<?> getAllApplicants() {

        return ResponseEntity.ok(recruitmentService.getAllApplicants());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/applicants/{id}")
    public ResponseEntity<?> getApplicantById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(recruitmentService.getApplicantById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/applicants/{id}/evaluation")
    public ResponseEntity<?> getEvaluation(
            @PathVariable Integer id) {

        return ResponseEntity.ok(recruitmentService.getEvaluation(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/applicants/{id}/accept")
    public ResponseEntity<?> acceptApplicant(
            @PathVariable Integer id) {

        recruitmentService.acceptApplicant(id);
        return ResponseEntity.ok("Applicant accepted successfully.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/applicants/{id}/reject")
    public ResponseEntity<?> rejectApplicant(
            @PathVariable Integer id) {

        recruitmentService.rejectApplicant(id);
        return ResponseEntity.ok("Applicant rejected successfully.");
    }
}