package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.dto.AIEvaluationResponseDto;
import com.sunbeam.CRM.dto.ApplicantEvaluationResponseDto;
import com.sunbeam.CRM.dto.ApplicantRegistrationRequestDto;
import com.sunbeam.CRM.dto.ApplicantResponseDto;
import com.sunbeam.CRM.entities.*;
import com.sunbeam.CRM.exception.ResourceNotFoundException;
import com.sunbeam.CRM.repository.AIEvaluationRepository;
import com.sunbeam.CRM.repository.ApplicantRepository;
import com.sunbeam.CRM.repository.UserRepository;
import com.sunbeam.CRM.service.AIService;
import com.sunbeam.CRM.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecruitmentServiceImpl implements RecruitmentService {

    private final ApplicantRepository applicantRepository;
    private final AIEvaluationRepository aiEvaluationRepository;
    private final UserRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final AIService aiService;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = false)
    public void registerApplicant(ApplicantRegistrationRequestDto request) {

        if (applicantRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered.");
        }

        if (applicantRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered.");
        }

        Applicant applicant = modelMapper.map(request, Applicant.class);

        // Save applicant first so it gets an ID
        applicantRepository.save(applicant);

        // Call Python AI service
        AIEvaluationResponseDto aiResponse =
                aiService.evaluateApplicant(applicant);

        // Map Python response to AIEvaluation
        AIEvaluation evaluation =
                modelMapper.map(aiResponse, AIEvaluation.class);

        evaluation.setApplicant(applicant);

        // Save AI evaluation
        aiEvaluationRepository.save(evaluation);
    }

    @Override
    public List<ApplicantResponseDto> getAllApplicants() {
        List<AIEvaluation> evaluations = aiEvaluationRepository.findAllByOrderByScoreDesc();

        List<ApplicantResponseDto> responseList = new ArrayList<>();

        for (AIEvaluation evaluation : evaluations) {

            Applicant applicant = evaluation.getApplicant();

            ApplicantResponseDto response = new ApplicantResponseDto();

            response.setId(applicant.getId());
            response.setName(applicant.getName());
            response.setEmail(applicant.getEmail());
            response.setPhone(applicant.getPhone());

            response.setScore(evaluation.getScore());
            response.setRecommendation(evaluation.getRecommendation());

            response.setStatus(applicant.getStatus());

            responseList.add(response);
        }

        return responseList;
    }

    @Override
    public ApplicantEvaluationResponseDto getApplicantById(Integer applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Applicant not found with id : " + applicantId));

        AIEvaluation evaluation = aiEvaluationRepository.findByApplicantId(applicantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("AI Evaluation not found for applicant id : " + applicantId));

        ApplicantEvaluationResponseDto response  = modelMapper.map(applicant, ApplicantEvaluationResponseDto.class);
        response.setScore(evaluation.getScore());
        response.setAnalysis(evaluation.getAnalysis());
        response.setRecommendation(evaluation.getRecommendation());

        return response;
    }

    @Override
    public AIEvaluationResponseDto getEvaluation(Integer applicantId) {
        AIEvaluation evaluation = aiEvaluationRepository.findByApplicantId(applicantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("AI Evaluation not found for applicant id : " + applicantId));

        return modelMapper.map(evaluation, AIEvaluationResponseDto.class);
    }

    @Override
    @Transactional
    public void acceptApplicant(Integer applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Applicant not found with id : " + applicantId));

        applicant.setStatus(ApplicationStatus.ACCEPTED);

        applicantRepository.save(applicant);

        Users employee = new Users();

        employee.setName(applicant.getName());
        employee.setEmail(applicant.getEmail());

        // Already BCrypt encoded during registration
        employee.setPassword(applicant.getPassword());

        employee.setRole(Role.EMPLOYEE);

        usersRepository.save(employee);
    }

    @Override
    @Transactional
    public void rejectApplicant(Integer applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Applicant not found with id : " + applicantId));

        applicant.setStatus(ApplicationStatus.REJECTED);

        applicantRepository.save(applicant);
    }
}