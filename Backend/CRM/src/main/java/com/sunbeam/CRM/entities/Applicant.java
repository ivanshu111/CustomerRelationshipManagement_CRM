package com.sunbeam.CRM.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "applicants")
@Getter
@Setter
@NoArgsConstructor
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "applicant_id")
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 10)
    private String phone;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 1000)
    private String answer1;

    @Column(nullable = false, length = 1000)
    private String answer2;

    @Column(nullable = false, length = 1000)
    private String answer3;

    @Column(nullable = false, length = 1000)
    private String answer4;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name="created_at",nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @JsonIgnore
    @OneToOne(mappedBy = "applicant", cascade = CascadeType.ALL)
    @Column(name="ai_evaluation")
    private AIEvaluation aiEvaluation;
}