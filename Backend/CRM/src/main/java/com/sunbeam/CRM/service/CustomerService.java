package com.sunbeam.CRM.service;

import com.sunbeam.CRM.dto.CustomerResponseDto;

import java.util.List;

public interface CustomerService {
    List<CustomerResponseDto> getInterestedCustomers();
    CustomerResponseDto getCustomerById(Integer customerId);

    List<CustomerResponseDto> getMyCustomers();

    List<CustomerResponseDto> getPendingCustomers();
}
