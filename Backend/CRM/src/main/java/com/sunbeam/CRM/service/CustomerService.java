package com.sunbeam.CRM.service;

import java.util.List;

import com.sunbeam.CRM.dto.CustomerRequestDto;
import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.entities.LeadStatus;

public interface CustomerService {
    List<CustomerResponseDto> getInterestedCustomers();
    CustomerResponseDto getCustomerById(Integer customerId);

    List<CustomerResponseDto> getMyCustomers();

    List<CustomerResponseDto> getPendingCustomers();

    CustomerResponseDto addCustomer( CustomerRequestDto dto);

    void updateLeadStatus(Integer customerId,  LeadStatus status);

    List<CustomerResponseDto> getNotInterestedCustomers();

    CustomerResponseDto updateCustomer(Integer customerId, CustomerRequestDto customerRequestDto);

    long getCustomerCount(Integer employeeId);
    List<CustomerResponseDto> getClosedCustomers();
}
