package com.sunbeam.CRM.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_evaluations")
@Getter
@Setter
@NoArgsConstructor
public class AIEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evaluation_id")
    private Integer id;

    @Column(nullable = false)
    private Float score;

    @Column(nullable = false, length = 2000)
    private String analysis;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Recommendation recommendation;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime evaluatedAt;


}