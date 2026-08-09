package com.sunbeam.CRM.dto;

import java.time.LocalDate;

import com.sunbeam.CRM.entities.LeadStatus;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InteractionRequestDto {

    @NotNull(message = "Customer ID is required")
    @Positive(message = "Customer ID must be a positive number")
    private Integer customerId;

    @NotBlank(message = "Notes are required")
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @NotNull(message = "Lead status is required")
    private LeadStatus status;

    @FutureOrPresent(message = "Next follow-up date cannot be in the past")
    private LocalDate nextFollowUpDate;
}
