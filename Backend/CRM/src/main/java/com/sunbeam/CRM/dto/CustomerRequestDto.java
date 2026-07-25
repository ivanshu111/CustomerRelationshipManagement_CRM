package com.sunbeam.CRM.dto;

import lombok.Data;

@Data
public class CustomerRequestDto {
    private String name;
    private String email;
    private String phone;
    private Integer assignedToUserId; //optional ADMIN can assign
}
