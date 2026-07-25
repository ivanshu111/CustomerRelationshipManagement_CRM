package com.sunbeam.CRM.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BlockRequestDto {
    @NotBlank(message = "Block reason cannot be blank")
    private String blockReason;

    @Min(value = 1, message = "Block duration must be at least 1 day")
    private Integer blockDuration;
}
