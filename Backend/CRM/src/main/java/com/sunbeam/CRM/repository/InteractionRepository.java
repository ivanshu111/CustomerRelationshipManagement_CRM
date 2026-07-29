package com.sunbeam.CRM.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sunbeam.CRM.entities.Interaction;

public interface InteractionRepository extends JpaRepository<Interaction, Integer> {
     List<Interaction> findByCustomerId(Integer customerId);
}
