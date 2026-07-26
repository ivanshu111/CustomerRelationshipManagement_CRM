package com.sunbeam.CRM.controller;

import com.sunbeam.CRM.dto.ResignationRequestDto;
import com.sunbeam.CRM.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final AdminService adminService;

    @PostMapping("/resign")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> submitResignation(@Valid @RequestBody ResignationRequestDto dto) {
        adminService.submitResignation(dto);
        return ResponseEntity.ok("Resignation request submitted successfully");
    }

    @PostMapping("/request-unblock")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> requestUnblock(@RequestBody java.util.Map<String, String> body) {
        String reason = body.get("reason");
        adminService.requestUnblock(reason);
        return ResponseEntity.ok("Unblock request submitted successfully");
    }
}
