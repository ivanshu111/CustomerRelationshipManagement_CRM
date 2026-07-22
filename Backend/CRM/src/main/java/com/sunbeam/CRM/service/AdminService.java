package com.sunbeam.CRM.service;

import com.sunbeam.CRM.dto.EmployeeResponseDto;

import java.util.List;

public interface AdminService {
    List<EmployeeResponseDto> getAllEmployees();
}
