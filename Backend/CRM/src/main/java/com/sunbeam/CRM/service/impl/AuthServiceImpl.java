package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.dto.RegisterRequestDto;
import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Role;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.UserRepository;
import com.sunbeam.CRM.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public void register(RegisterRequestDto registerRequest) {
        //check for duplicate email
        if(userRepository.existsByEmail(registerRequest.getEmail())){
            throw new RuntimeException("Email already exists");
        }

        //create user
        Users user= new Users();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(Role.valueOf(registerRequest.getRole()));
        user.setEmployeeStatus(EmployeeStatus.ACTIVE);

        userRepository.save(user);
    }
}
