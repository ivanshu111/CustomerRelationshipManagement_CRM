package com.sunbeam.CRM.repository;

import com.sunbeam.CRM.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Integer, Users> {
    Optional<Users> findByEmail(String email);
}
