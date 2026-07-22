package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Role;
import com.sunbeam.CRM.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Integer> {
    Optional<Users> findByEmail(String email);
    Boolean existsByEmail(String email);

    List<Users> findByRoleAndEmployeeStatusNot(Role role, EmployeeStatus employeeStatus);
}
