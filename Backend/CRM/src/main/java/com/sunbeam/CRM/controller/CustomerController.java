package com.sunbeam.CRM.controller;

import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @GetMapping("/interested")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getInterestedCustomers(){
        List<CustomerResponseDto> customers = customerService.getInterestedCustomers();
        return ResponseEntity.ok(customers);
    }
}
