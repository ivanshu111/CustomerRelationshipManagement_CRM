package com.sunbeam.CRM.controller;

import com.sunbeam.CRM.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final CustomerService customerService;

    @GetMapping("/customers/count")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<Long> getCustomerCount(@RequestParam(required = false) Integer employeeId) {
        long count = customerService.getCustomerCount(employeeId);
        return ResponseEntity.ok(count);
    }
}
