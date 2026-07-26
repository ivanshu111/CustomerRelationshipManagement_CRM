package com.sunbeam.CRM.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sunbeam.CRM.dto.BlockRequestDto;
import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.dto.EmployeeResponseDto;
import com.sunbeam.CRM.dto.InteractionResponseDto;
import com.sunbeam.CRM.service.AdminService;
import com.sunbeam.CRM.service.LeadsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final LeadsService leadsService;

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

    @PutMapping("/employees/{id}/approve-resignation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveResignation(@PathVariable Integer id) {
        adminService.approveResignation(id);
        return ResponseEntity.ok("Employee resignation approved successfully");
    }

    @PostMapping("/access-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveAccessRequest(@PathVariable Integer id) {
        adminService.approveAccessRequest(id);
        return ResponseEntity.ok("Access request approved successfully");
    }

    @PutMapping("/employees/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> blockEmployee(@PathVariable Integer id, @Valid @RequestBody BlockRequestDto blockRequestDto) {
        adminService.blockEmployee(id, blockRequestDto);
        return ResponseEntity.ok("Employee blocked successfully");
    }

    @PutMapping("/employees/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unblockEmployee(@PathVariable Integer id) {
        adminService.unblockEmployee(id);
        return ResponseEntity.ok("Employee unblocked successfully");
    }

    @GetMapping("/employees/blocked")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBlockedEmployees() {
        List<EmployeeResponseDto> blocked = adminService.getBlockedEmployees();
        return ResponseEntity.ok(blocked);
    }

    @GetMapping("/leads/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getLeadsCount(){
        long count = leadsService.getLeadsCount();
        return ResponseEntity.ok(count);
    }

    @PutMapping("/employees/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreEmployee(@PathVariable Integer id) {
        adminService.restoreEmployee(id);
        return ResponseEntity.ok("Employee restored successfully");
    }

    @GetMapping("/analytics/best-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBestPerformingEmployee(){
        String bestEmployee = adminService.getBestPerformingEmployee();

        if(bestEmployee == null){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(bestEmployee);
    }

    @DeleteMapping("/employees/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> softDeleteEmployee(@PathVariable Integer id) {
        adminService.softDeleteEmployee(id);
        return ResponseEntity.ok("Employee soft deleted successfully");
    }

    @GetMapping("/leads/closed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getLeadsCountWithStatusClosed(){
        long count = leadsService.getLeadsCountWithStatusClosed();
        return ResponseEntity.ok(count);
    }

    @PutMapping("/employees/{id}/reject-resignation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectResignation(@PathVariable Integer id) {
        adminService.rejectResignation(id);
        return ResponseEntity.ok("Employee resignation rejected successfully");
    }

    @GetMapping("/employees/deleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDeletedEmployees() {
        List<EmployeeResponseDto> deleted = adminService.getDeletedEmployees();
        return ResponseEntity.ok(deleted);
    }

    @GetMapping("/access-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingAccessRequests() {
        return ResponseEntity.ok(adminService.getPendingAccessRequests());
    }

    @PostMapping("/access-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectAccessRequest(@PathVariable Integer id) {
        adminService.rejectAccessRequest(id);
        return ResponseEntity.ok("Access request rejected successfully");
    }

}
