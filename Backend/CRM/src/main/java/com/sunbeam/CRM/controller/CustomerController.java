package com.sunbeam.CRM.controller;

import com.sunbeam.CRM.dto.CustomerRequestDto;
import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getCustomerById(@PathVariable Integer id){
        CustomerResponseDto customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> addCustomer(@Valid @RequestBody CustomerRequestDto dto){
        CustomerResponseDto customer= customerService.addCustomer(dto);
        return ResponseEntity.ok(customer);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getMyCustomers(){
        return ResponseEntity.ok(customerService.getMyCustomers());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getPendingCustomers(){
        return ResponseEntity.ok(customerService.getPendingCustomers());
    }

    @GetMapping("/not-interested")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getNotInterestedCustomers(){
        return ResponseEntity.ok(customerService.getNotInterestedCustomers());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> updateCustomer(@PathVariable Integer id, @Valid @RequestBody CustomerRequestDto dto){
        CustomerResponseDto customer = customerService.updateCustomer(id, dto);
        return ResponseEntity.ok(customer);
    }
}
