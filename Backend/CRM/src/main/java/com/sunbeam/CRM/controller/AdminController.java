package com.sunbeam.CRM.controller;

import java.util.List;

import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.dto.EmployeeResponseDto;
import com.sunbeam.CRM.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.dto.InteractionResponseDto;
import com.sunbeam.CRM.service.AdminService;

import lombok.RequiredArgsConstructor;

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

    @GetMapping("/employees/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEmployeeById(@PathVariable Integer id ){
        return ResponseEntity.ok(adminService.getEmployeeById(id));
    }

    @GetMapping("/employee/{id}/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCustomersOfEmployee(@PathVariable Integer id){
        List<CustomerResponseDto> customers = adminService.getAllCustomersOfEmployee(id);
        return ResponseEntity.ok(customers);
    }

     @GetMapping("/interactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllInteractions(){
       List<InteractionResponseDto> interactions = adminService.getAllInteractions();
       return ResponseEntity.ok(interactions);
    }

    @GetMapping("/employees/resignations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getResignationRequests() {
        List<EmployeeResponseDto> requests = adminService.getResignationRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCustomers(
            @RequestParam(required = false) String search,
            Pageable pageable){
        Page<CustomerResponseDto> customers = adminService.getAllCustomers(search, pageable);
        return ResponseEntity.ok(customers);
    }

}
