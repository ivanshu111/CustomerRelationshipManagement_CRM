package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.Customers;
import com.sunbeam.CRM.entities.LeadStatus;
import com.sunbeam.CRM.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customers, Integer> {
    List<Customers> findByAssignedToId(Integer id);

    @Query("SELECT DISTINCT c FROM Customer c JOIN c.leads l WHERE c.assignedTo = :employee AND l.status = :status")
    List<Customers> findByAssignedToAndLeadStatus(@Param("employee") Users employee, @Param("status") LeadStatus status);

    @Query("SELECT DISTINCT c FROM Customer c JOIN c.leads l WHERE l.status = :status")
    List<Customers> findByLeadStatus(@Param("status") LeadStatus status);

    Optional<Customers> findByIdAndAssignedTo(Integer id, Users assignedTo);
}
