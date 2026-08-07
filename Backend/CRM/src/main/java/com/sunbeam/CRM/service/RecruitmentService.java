package com.sunbeam.CRM.service;


import com.sunbeam.CRM.dto.AIEvaluationResponseDto;
import com.sunbeam.CRM.dto.ApplicantEvaluationResponseDto;
import com.sunbeam.CRM.dto.ApplicantRegistrationRequestDto;
import com.sunbeam.CRM.dto.ApplicantResponseDto;

import java.util.List;

public interface RecruitmentService {

    void registerApplicant(ApplicantRegistrationRequestDto request);

    List<ApplicantResponseDto> getAllApplicants();

    ApplicantEvaluationResponseDto getApplicantById(Integer applicantId);

    AIEvaluationResponseDto getEvaluation(Integer applicantId);

    void acceptApplicant(Integer applicantId);

    void rejectApplicant(Integer applicantId);

}