package com.sunbeam.CRM.dto;

import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDto {
    private Integer id;
    private String name;
    private String email;
    private Role role;
    private String created_at;
    private EmployeeStatus employeeStatus;

    private String resignationReason;
    private LocalDateTime resignationRequestedAt;
    private LocalDate lastWorkingDate;
    private LocalDateTime resignationApprovedAt;
    private String resignationApprovedByEmail;

    private String blockedReason;
    private LocalDateTime blockedAt;
    private LocalDateTime blockedUntil;
    private boolean blockRemovalRequested;
    private String blockRemovalReason;

    private LocalDateTime deletedAt;
    private String deletedByEmail;
}
