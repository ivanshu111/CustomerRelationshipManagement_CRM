package com.sunbeam.CRM.dto;

import lombok.Data;

@Data
public class CustomerResponseDto {
    private Integer id;
    private String name;
    private String email;
    private String phone;
    private String assignedToName;
    private Integer assignedToId;
    private String status;
}
