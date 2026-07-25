package com.sunbeam.CRM.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ResignationRequestDto {

    @NotBlank(message = "Resignation reason cannot be blank")
    private String resignationReason;

    @NotNull(message = "Last working date is required")
    @FutureOrPresent(message = "Last working date must be in the present or future")
    private LocalDate lastWorkingDate;
}
