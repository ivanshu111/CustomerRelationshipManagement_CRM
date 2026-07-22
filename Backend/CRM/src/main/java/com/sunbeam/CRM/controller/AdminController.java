package com.sunbeam.CRM.controller;

import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;


    @GetMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllEmployees(){
        return ResponseEntity.ok(adminService.getAllEmployees());
    }

    @GetMapping("/employee/{id}/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCustomersOfEmployee(@PathVariable Integer id){
        List<CustomerResponseDto> customers = adminService.getAllCustomersOfEmployee(id);
        return ResponseEntity.ok(customers);
    }

}
