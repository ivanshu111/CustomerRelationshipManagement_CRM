package com.sunbeam.CRM.dto;

import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDto {
    private Integer id;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
    private EmployeeStatus employeeStatus;
    private boolean blockRemovalRequested;
    private String blockRemovalReason;
    private String blockedReason;
    private LocalDateTime blockedAt;
    private LocalDateTime blockedUntil;
}
