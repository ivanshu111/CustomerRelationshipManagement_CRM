package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.LeadStatus;
import com.sunbeam.CRM.entities.Leads;
import com.sunbeam.CRM.entities.Users;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.sunbeam.CRM.entities.LeadStatus;
import com.sunbeam.CRM.entities.Leads;
import com.sunbeam.CRM.entities.Users;

@Repository
public interface LeadsRepository  extends JpaRepository<Leads, Integer> {
    Optional<Leads> findTopByCustomerIdOrderByIdDesc(Integer customerId);

     Optional<Leads> findByCustomerId(Integer customerId);

    @Query("SELECT l.employee FROM Leads l WHERE l.status = com.sunbeam.CRM.entities.LeadStatus.CLOSED GROUP BY l.employee ORDER BY COUNT(l) DESC")
    List<Users> findBestPerformingEmployee();

    long countByStatus(LeadStatus status);
}
