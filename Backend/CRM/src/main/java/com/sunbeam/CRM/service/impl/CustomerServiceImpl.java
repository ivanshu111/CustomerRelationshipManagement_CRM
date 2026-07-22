package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.customer_expection.ResourceNotFoundException;
import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.entities.*;
import com.sunbeam.CRM.repository.CustomerRepository;
import com.sunbeam.CRM.repository.UserRepository;
import com.sunbeam.CRM.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<CustomerResponseDto> getInterestedCustomers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Customers> customers;
        if (loggedInUser.getRole() == Role.ADMIN) {
            customers = customerRepository.findByLeadStatus(LeadStatus.INTERESTED);
        } else {
            customers = customerRepository.findByAssignedToAndLeadStatus(loggedInUser, LeadStatus.INTERESTED);
        }

        return customers.stream().map(customer -> mapToResponseDto(customer)).collect(Collectors.toList());
    }

    @Override
    public CustomerResponseDto getCustomerById(Integer customerId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customers customer;
        if (loggedInUser.getRole() == Role.ADMIN) {
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        } else {
            customer = customerRepository.findByIdAndAssignedTo(customerId, loggedInUser)
                    .orElseThrow(() -> new RuntimeException("Customer not found or not assigned to you"));
        }

        return mapToResponseDto(customer);
    }

    @Override
    public List<CustomerResponseDto> getMyCustomers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Find user
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get customers assigned to this user
        List<Customers> customers = customerRepository.findByAssignedTo(loggedInUser);

        // Map to Response DTO using lambda expression as requested
        return customers.stream()
                .map(customer -> mapToResponseDto(customer))
                .toList();

    }

    @Override
    public List<CustomerResponseDto> getPendingCustomers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Customers> customers;
        if (loggedInUser.getRole() == Role.ADMIN) {
            customers = customerRepository.findByLeadStatus(LeadStatus.PENDING);
        } else {
            customers = customerRepository.findByAssignedToAndLeadStatus(loggedInUser, LeadStatus.PENDING);
        }

        return customers.stream()
                .map(customer -> mapToResponseDto(customer))
                .toList();
    }

    private CustomerResponseDto mapToResponseDto(Customers customer) {
        CustomerResponseDto responseDto = modelMapper.map(customer, CustomerResponseDto.class);
        responseDto.setAssignedToName(customer.getAssignedTo() != null ? customer.getAssignedTo().getName() : "None");
        responseDto.setAssignedToId(customer.getAssignedTo() != null ? customer.getAssignedTo().getId() : null);

        if (customer.getLeads() != null && !customer.getLeads().isEmpty()) {
            customer.getLeads().stream()
                    .max(Comparator.comparing(Leads::getId))
                    .ifPresent(latestLead -> responseDto.setStatus(latestLead.getStatus().name()));
        } else {
            responseDto.setStatus("PENDING");
        }

        return responseDto;
    }
}
