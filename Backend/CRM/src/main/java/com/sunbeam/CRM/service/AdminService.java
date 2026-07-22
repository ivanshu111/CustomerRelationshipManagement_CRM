package com.sunbeam.CRM.service;

import java.util.List;

import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.dto.EmployeeResponseDto;
import com.sunbeam.CRM.dto.InteractionResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    List<EmployeeResponseDto> getAllEmployees();
    List<CustomerResponseDto> getAllCustomersOfEmployee(Integer id);
     List<InteractionResponseDto> getAllInteractions();

    EmployeeResponseDto getEmployeeById(Integer id);

    List<EmployeeResponseDto> getResignationRequests();

    Page<CustomerResponseDto> getAllCustomers(String search, Pageable pageable);

    void approveResignation(Integer employeeId);

    void approveAccessRequest(Integer employeeId);
}
