package com.sunbeam.CRM.dto;

import com.sunbeam.CRM.entities.Recommendation;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AIEvaluationResponseDto {

    private Float score;

    private String analysis;

    private Recommendation recommendation;
}