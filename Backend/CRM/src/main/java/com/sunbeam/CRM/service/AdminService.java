package com.sunbeam.CRM.service;

import java.util.List;

import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.dto.EmployeeResponseDto;
import com.sunbeam.CRM.dto.InteractionResponseDto;

public interface AdminService {
    List<EmployeeResponseDto> getAllEmployees();
    List<CustomerResponseDto> getAllCustomersOfEmployee(Integer id);
     List<InteractionResponseDto> getAllInteractions();
}
