package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.customer_expection.ResourceNotFoundException;
import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.dto.EmployeeResponseDto;
import com.sunbeam.CRM.entities.*;
import com.sunbeam.CRM.repository.CustomerRepository;
import com.sunbeam.CRM.repository.UserRepository;
import com.sunbeam.CRM.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final CustomerRepository customerRepository;

    @Override
    public List<EmployeeResponseDto> getAllEmployees() {
        List<Users> users = userRepository.findByRoleAndEmployeeStatusNot(Role.EMPLOYEE, EmployeeStatus.DELETED);
        return users.stream()
                .map(user -> mapToDto(user))
                .collect(Collectors.toList());
    }

    @Override
    public List<CustomerResponseDto> getAllCustomersOfEmployee(Integer id) {
        Users employee = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return customerRepository.findByAssignedToId(id).stream()
                .map(customer -> mapToCustomerDto(customer))
                .toList();
    }

    private EmployeeResponseDto mapToDto(Users user) {
        if (user == null) return null;
        EmployeeResponseDto dto = modelMapper.map(user, EmployeeResponseDto.class);
        if (user.getCreatedAt() != null) {
            dto.setCreated_at(user.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));
        }
        if (user.getResignationApprovedBy() != null) {
            dto.setResignationApprovedByEmail(user.getResignationApprovedBy().getEmail());
        }
        if (user.getDeletedBy() != null) {
            dto.setDeletedByEmail(user.getDeletedBy().getEmail());
        }
        return dto;
    }

    private CustomerResponseDto mapToCustomerDto(Customers customer) {
        if (customer == null) return null;
        CustomerResponseDto dto = modelMapper.map(customer, CustomerResponseDto.class);
        if (customer.getAssignedTo() != null) {
            dto.setAssignedToName(customer.getAssignedTo().getName());
        }
        if (customer.getLeads() != null && !customer.getLeads().isEmpty()) {
            customer.getLeads().stream()
                    .max(java.util.Comparator.comparing(Leads::getId))
                    .ifPresent(latestLead -> dto.setStatus(latestLead.getStatus().name()));
        } else {
            dto.setStatus("PENDING");
        }
        return dto;
    }
}
