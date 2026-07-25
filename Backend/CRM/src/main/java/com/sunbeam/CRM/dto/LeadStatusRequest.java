package com.sunbeam.CRM.dto;

import com.sunbeam.CRM.entities.LeadStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeadStatusRequest {
    @NotNull(message = "Status cannot be null")
    private LeadStatus status;
}
