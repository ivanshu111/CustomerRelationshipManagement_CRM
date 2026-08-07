package com.sunbeam.CRM.dto;


import com.sunbeam.CRM.entities.ApplicationStatus;
import com.sunbeam.CRM.entities.Recommendation;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicantResponseDto {

    private Integer id;

    private String name;

    private String email;

    private String phone;

    private Float score;

    private Recommendation recommendation;

    private ApplicationStatus status;
}