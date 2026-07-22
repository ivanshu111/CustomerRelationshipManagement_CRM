package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.Customers;
import com.sunbeam.CRM.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customers, Integer> {
    List<Customers> findByAssignedToId(Integer id);
}
