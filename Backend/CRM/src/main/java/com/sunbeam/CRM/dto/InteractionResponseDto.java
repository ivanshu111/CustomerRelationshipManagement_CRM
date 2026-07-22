package com.sunbeam.CRM.dto;



import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sunbeam.CRM.entities.LeadStatus;

import lombok.Data;

@Data

public class InteractionResponseDto {
    private Integer id;
    private String notes;
    private LocalDateTime interactionDate;
    private LeadStatus status;
    private LocalDate nextFollowUpDate;
    
    // Details related to customer
    private CustomerResponseDto customer;
    
    // Details related to employee who performed the interaction/is assigned
    private EmployeeResponseDto employee;
    
}
