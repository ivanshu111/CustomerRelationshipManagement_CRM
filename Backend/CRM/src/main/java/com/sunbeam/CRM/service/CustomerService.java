package com.sunbeam.CRM.service;

import com.sunbeam.CRM.dto.CustomerRequestDto;
import com.sunbeam.CRM.dto.CustomerResponseDto;
import com.sunbeam.CRM.entities.LeadStatus;

import java.util.List;

public interface CustomerService {
    List<CustomerResponseDto> getInterestedCustomers();
    CustomerResponseDto getCustomerById(Integer customerId);

    List<CustomerResponseDto> getMyCustomers();

    List<CustomerResponseDto> getPendingCustomers();

    CustomerResponseDto addCustomer( CustomerRequestDto dto);

    void updateLeadStatus(Integer customerId,  LeadStatus status);
}
