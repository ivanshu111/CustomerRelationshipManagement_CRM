package com.sunbeam.CRM.dto.ai;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AIResponse {

    private Float score;

    private String analysis;

    private String recommendation;

}