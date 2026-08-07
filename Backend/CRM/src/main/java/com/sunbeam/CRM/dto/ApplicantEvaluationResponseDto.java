package com.sunbeam.CRM.dto;

import com.sunbeam.CRM.entities.ApplicationStatus;
import com.sunbeam.CRM.entities.Recommendation;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantEvaluationResponseDto {

    private Float score;

    private String analysis;

    private Recommendation recommendation;

    private String name;

    private String email;

    private String phone;

    private String answer1;

    private String answer2;

    private String answer3;

    private String answer4;

    private ApplicationStatus status;
}