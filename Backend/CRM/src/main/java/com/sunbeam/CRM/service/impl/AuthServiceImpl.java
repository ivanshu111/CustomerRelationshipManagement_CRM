package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.exception.UserAlreadyExistsException;
import com.sunbeam.CRM.dto.RegisterRequestDto;
import com.sunbeam.CRM.dto.UserResponseDto;
import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Role;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.UserRepository;
import com.sunbeam.CRM.service.AuthService;
import com.sunbeam.CRM.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

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

    @Override
    public UserResponseDto getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));

        return modelMapper.map(user,UserResponseDto.class);
    }

    @Override
    public void requestAccess(RegisterRequestDto registerRequestDto) {
        if(userRepository.existsByEmail(registerRequestDto.getEmail())){
            throw new UserAlreadyExistsException("Email already exists");
        }

        Users user = new Users();
        user.setName(registerRequestDto.getName());
        user.setEmail(registerRequestDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequestDto.getPassword()));
        user.setRole(Role.EMPLOYEE);
        user.setEmployeeStatus(EmployeeStatus.PENDING);

        userRepository.save(user);
    }
}
