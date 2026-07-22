package com.sunbeam.CRM.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sunbeam.CRM.entities.Interaction;

public interface InteractionRepository extends JpaRepository<Interaction, Integer> {
    
}
