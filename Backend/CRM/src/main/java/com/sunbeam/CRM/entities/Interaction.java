package com.sunbeam.CRM.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor @NoArgsConstructor
@Data
public class Interaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String notes;
    private LocalDateTime interactionDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LeadStatus status;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customers customer;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Users employee;

    private LocalDate nextFollowUpDate;
}
