package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.dto.AIEvaluationResponseDto;
import com.sunbeam.CRM.dto.ai.AIRequest;
import com.sunbeam.CRM.dto.ai.AIResponse;
import com.sunbeam.CRM.entities.Applicant;
import com.sunbeam.CRM.entities.Recommendation;
import com.sunbeam.CRM.service.AIService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class AIServiceImpl implements AIService {

    private final RestClient restClient;

    @Value("${ai.service.api-key}")
    private String apiKey;

    public AIServiceImpl(
            @Qualifier("aiRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    public AIEvaluationResponseDto evaluateApplicant(Applicant applicant) {

        AIRequest request = new AIRequest();

        request.setName(applicant.getName());

        request.setAnswers(List.of(
                applicant.getAnswer1(),
                applicant.getAnswer2(),
                applicant.getAnswer3(),
                applicant.getAnswer4()
        ));

        AIResponse response = restClient.post()
                .uri("/api/ai/evaluate")
                .header("X-API-Key", apiKey)
                .body(request)
                .retrieve()
                .body(AIResponse.class);

        if (response == null) {
            throw new RuntimeException("AI service returned an empty response.");
        }

        AIEvaluationResponseDto evaluation = new AIEvaluationResponseDto();

        evaluation.setScore(response.getScore());
        evaluation.setAnalysis(response.getAnalysis());
        evaluation.setRecommendation(Recommendation.valueOf(response.getRecommendation()));

        return evaluation;
    }
}