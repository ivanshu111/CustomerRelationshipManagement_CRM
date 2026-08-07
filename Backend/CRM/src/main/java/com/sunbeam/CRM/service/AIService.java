package com.sunbeam.CRM.service;


import com.sunbeam.CRM.dto.AIEvaluationResponseDto;
import com.sunbeam.CRM.entities.Applicant;

public interface AIService {

    AIEvaluationResponseDto evaluateApplicant(Applicant applicant);

}