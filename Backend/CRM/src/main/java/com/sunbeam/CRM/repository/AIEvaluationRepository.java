package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.AIEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AIEvaluationRepository extends JpaRepository<AIEvaluation, Integer> {
    Optional<AIEvaluation> findByApplicantId(Integer applicantId);

    List<AIEvaluation> findAllByOrderByScoreDesc();
}
