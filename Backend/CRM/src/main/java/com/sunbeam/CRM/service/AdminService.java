package com.sunbeam.CRM.service;

import java.time.LocalDate;
import java.util.List;

import com.sunbeam.CRM.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.sunbeam.CRM.entities.Users;

public interface AdminService {
    List<EmployeeResponseDto> getAllEmployees();
    List<CustomerResponseDto> getAllCustomersOfEmployee(Integer id);
     List<InteractionResponseDto> getAllInteractions();

    EmployeeResponseDto getEmployeeById(Integer id);

    

    List<EmployeeResponseDto> getResignationRequests();

    Page<CustomerResponseDto> getAllCustomers(String search, Pageable pageable);

    void approveResignation(Integer employeeId);

    void approveAccessRequest(Integer employeeId);

    void blockEmployee(Integer employeeId, BlockRequestDto blockRequestDto);

    void unblockEmployee(Integer employeeId);

    void submitResignation(ResignationRequestDto dto);

    void restoreEmployee(Integer employeeId);

    BestEmployeeDto getBestPerformingEmployee();


    void softDeleteEmployee(Integer id);

    List<EmployeeResponseDto> getBlockedEmployees();
    void rejectResignation(Integer employeeId);
    List<EmployeeResponseDto> getDeletedEmployees();

     List<EmployeeResponseDto> getPendingAccessRequests();
     void rejectAccessRequest(Integer employeeId);
     void requestUnblock(String reason);


    double getConversionRateByEmployee(Integer employeeId);

    double getConversionRate();
}
