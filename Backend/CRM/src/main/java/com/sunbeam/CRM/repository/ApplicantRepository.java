package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicantRepository extends JpaRepository<Applicant, Integer> {
    Optional<Applicant> findByEmail(String email);

    Optional<Applicant> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}



