package com.sunbeam.CRM.service.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sunbeam.CRM.dto.BlockRequestDto;
import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.dto.EmployeeResponseDto;
import com.sunbeam.CRM.dto.InteractionResponseDto;
import com.sunbeam.CRM.dto.ResignationRequestDto;
import com.sunbeam.CRM.entities.Customers;
import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Leads;
import com.sunbeam.CRM.entities.Role;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.exception.InvalidEmployeeStateException;
import com.sunbeam.CRM.exception.ResourceNotFoundException;
import com.sunbeam.CRM.repository.CustomerRepository;
import com.sunbeam.CRM.repository.InteractionRepository;
import com.sunbeam.CRM.repository.LeadsRepository;
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
    private final LeadsRepository leadsRepository;

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



    @Override
    @Transactional
    public void approveAccessRequest(Integer employeeId) {
        Users employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if (employee.getEmployeeStatus() != EmployeeStatus.PENDING) {
            throw new InvalidEmployeeStateException("Employee is not in PENDING status");
        }

        employee.setEmployeeStatus(EmployeeStatus.ACTIVE);
        userRepository.save(employee);
    }

    @Override
    @Transactional
    public void blockEmployee(Integer employeeId, BlockRequestDto requestDto) {
        Users employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if (employee.getRole() == Role.ADMIN) {
            throw new InvalidEmployeeStateException("Admins cannot be blocked");
        }

        if (employee.getEmployeeStatus() == EmployeeStatus.DELETED || employee.getEmployeeStatus() == EmployeeStatus.RESIGNED) {
            throw new InvalidEmployeeStateException("Cannot block an employee who is soft-deleted or resigned");
        }

        int durationDays = requestDto.getBlockDuration() != null ? requestDto.getBlockDuration() : 7;

        employee.setEmployeeStatus(EmployeeStatus.BLOCKED);
        employee.setBlockedReason(requestDto.getBlockReason());
        employee.setBlockedAt(LocalDateTime.now());
        employee.setBlockedUntil(LocalDateTime.now().plusDays(durationDays));

        userRepository.save(employee);
    }

    @Override
    @Transactional
    public void unblockEmployee(Integer employeeId) {
        Users employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if (employee.getEmployeeStatus() != EmployeeStatus.BLOCKED) {
            throw new InvalidEmployeeStateException("Employee is not blocked");
        }

        employee.setEmployeeStatus(EmployeeStatus.ACTIVE);
        employee.setBlockedReason(null);
        employee.setBlockedAt(null);
        employee.setBlockedUntil(null);
        employee.setBlockRemovalRequested(false);
        employee.setBlockRemovalReason(null);

        userRepository.save(employee);
    }

    @Override
    @Transactional
    public void submitResignation(ResignationRequestDto requestDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));

        if (employee.getRole() != Role.EMPLOYEE) {
            throw new InvalidEmployeeStateException("Only employees can submit resignation");
        }

        if (employee.getEmployeeStatus() == EmployeeStatus.DELETED || employee.getEmployeeStatus() == EmployeeStatus.RESIGNED) {
            throw new InvalidEmployeeStateException("Cannot resign. Current status: " + employee.getEmployeeStatus());
        }

        employee.setEmployeeStatus(EmployeeStatus.PENDING_RESIGNATION);
        employee.setResignationReason(requestDto.getResignationReason());
        employee.setLastWorkingDate(requestDto.getLastWorkingDate());
        employee.setResignationRequestedAt(LocalDateTime.now());

        userRepository.save(employee);
    }

    @Override
    @Transactional
    public void restoreEmployee(Integer employeeId) {
        Users employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if (employee.getEmployeeStatus() != EmployeeStatus.DELETED) {
            throw new InvalidEmployeeStateException("Employee is not soft deleted");
        }

        employee.setEmployeeStatus(EmployeeStatus.ACTIVE);
        employee.setDeletedAt(null);
        employee.setDeletedBy(null);

        userRepository.save(employee);
    }

    @Override
    public String getBestPerformingEmployee() {
        return leadsRepository.findBestPerformingEmployee().stream()
                .findFirst()
                .map(user -> user.getName())
                .orElse("No top performing employee found");
    }

    @Override
    @Transactional
    public void softDeleteEmployee(Integer employeeId) {
        Users employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if (employee.getRole() == Role.ADMIN) {
            throw new InvalidEmployeeStateException("Admins cannot be soft deleted");
        }

        if (employee.getEmployeeStatus() == EmployeeStatus.DELETED) {
            throw new InvalidEmployeeStateException("Employee is already soft deleted");
        }

        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Users admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + adminEmail));

        // Soft delete
        employee.setEmployeeStatus(EmployeeStatus.DELETED);
        employee.setDeletedAt(LocalDateTime.now());
        employee.setDeletedBy(admin);

        // Reassign all customers to ADMIN
        List<Customers> customers = customerRepository.findByAssignedTo(employee);
        for (Customers customer : customers) {
            customer.setAssignedTo(admin);
        }
        customerRepository.saveAll(customers);

        userRepository.save(employee);
    }

    @Override
    public List<EmployeeResponseDto> getBlockedEmployees() {
        List<Users> users = userRepository.findByRoleAndEmployeeStatus(Role.EMPLOYEE, EmployeeStatus.BLOCKED);
        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
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


    @Override
    @Transactional
    public void rejectResignation(Integer employeeId) {
        Users employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if (employee.getEmployeeStatus() != EmployeeStatus.PENDING_RESIGNATION) {
            throw new InvalidEmployeeStateException("Employee is not in PENDING_RESIGNATION status");
        }

        // Revert status to ACTIVE and clear resignation fields
        employee.setEmployeeStatus(EmployeeStatus.ACTIVE);
        employee.setResignationReason(null);
        employee.setLastWorkingDate(null);
        employee.setResignationRequestedAt(null);

        userRepository.save(employee);
    }


    @Override
    public List<EmployeeResponseDto> getDeletedEmployees() {
       List<Users> users = userRepository.findByRoleAndEmployeeStatus(Role.EMPLOYEE, EmployeeStatus.DELETED);
        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }


    @Override
    public List<EmployeeResponseDto> getPendingAccessRequests() {
       List<Users> users = userRepository.findByRoleAndEmployeeStatus(Role.EMPLOYEE, EmployeeStatus.PENDING);
        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
}
