package com.sunbeam.CRM.service.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import com.sunbeam.CRM.exception.InvalidEmployeeStateException;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sunbeam.CRM.exception.ResourceNotFoundException;
import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.dto.EmployeeResponseDto;
import com.sunbeam.CRM.dto.InteractionResponseDto;
import com.sunbeam.CRM.entities.Customers;
import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Leads;
import com.sunbeam.CRM.entities.Role;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.CustomerRepository;
import com.sunbeam.CRM.repository.InteractionRepository;
import com.sunbeam.CRM.repository.UserRepository;
import com.sunbeam.CRM.service.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final CustomerRepository customerRepository;
    private final InteractionRepository interactionRepository;

    @Override
    public List<EmployeeResponseDto> getAllEmployees() {
        List<Users> users = userRepository.findByRoleAndEmployeeStatusNot(Role.EMPLOYEE, EmployeeStatus.DELETED);
        return users.stream()
                .map(user -> mapToDto(user))
                .toList();
    }


    @Override
    public List<CustomerResponseDto> getAllCustomersOfEmployee(Integer id) {
        Users employee = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return customerRepository.findByAssignedToId(id).stream()
                .map(customer -> mapToCustomerDto(customer))
                .toList();
    }

     @Override
    public List<InteractionResponseDto> getAllInteractions() {
        return interactionRepository.findAll().stream()
                .map(interaction -> {
                    InteractionResponseDto dto = modelMapper.map(interaction, InteractionResponseDto.class);
                    dto.setEmployee(mapToDto(interaction.getEmployee()));
                    dto.setCustomer(mapToCustomerDto(interaction.getCustomer()));
                    return dto;
                }).toList();
    }


    @Override
    public EmployeeResponseDto getEmployeeById(Integer id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDto(user);
    }


    public List<EmployeeResponseDto> getResignationRequests() {
            List<Users> users = userRepository.findByRoleAndEmployeeStatus(Role.EMPLOYEE, EmployeeStatus.PENDING_RESIGNATION);
            return users.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
    }

    @Override
    public Page<CustomerResponseDto> getAllCustomers(String search, Pageable pageable) {
        Page<Customers> customers;
        if (search != null && !search.trim().isEmpty()) {
            customers = customerRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            customers = customerRepository.findAll(pageable);
        }
        return customers.map(this::mapToCustomerDto);
    }

    @Override
    @Transactional
    public void approveResignation(Integer employeeId) {
        Users employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if (employee.getEmployeeStatus() != EmployeeStatus.PENDING_RESIGNATION) {
            throw new InvalidEmployeeStateException("Employee is not in PENDING_RESIGNATION status");
        }

        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Users admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + adminEmail));

        // Update employee status to RESIGNED
        employee.setEmployeeStatus(EmployeeStatus.RESIGNED);
        employee.setResignationApprovedAt(LocalDateTime.now());
        employee.setResignationApprovedBy(admin);

        // Reassign all customers to ADMIN
        List<Customers> customers = customerRepository.findByAssignedTo(employee);
        for (Customers customer : customers) {
            customer.setAssignedTo(admin);
        }
        customerRepository.saveAll(customers);

        userRepository.save(employee);
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
