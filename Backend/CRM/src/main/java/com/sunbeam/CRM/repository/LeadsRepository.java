package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.Leads;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeadsRepository  extends JpaRepository<Leads, Integer> {
}
