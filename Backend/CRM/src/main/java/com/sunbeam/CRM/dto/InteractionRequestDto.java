package com.sunbeam.CRM.dto;

import java.time.LocalDate;

import com.sunbeam.CRM.entities.LeadStatus;

import lombok.Data;

@Data
public class InteractionRequestDto {
     private Integer customerId;
    private String notes;
    private LeadStatus status;
    private LocalDate nextFollowUpDate;
}
