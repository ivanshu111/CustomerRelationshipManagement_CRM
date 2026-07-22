package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Integer> {
    Optional<Users> findByEmail(String email);
    Boolean existsByEmail(String email);
}
