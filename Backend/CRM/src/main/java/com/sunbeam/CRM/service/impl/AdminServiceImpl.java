package com.sunbeam.CRM.service.impl;

import com.sunbeam.CRM.dto.EmployeeResponseDto;
import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Role;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.UserRepository;
import com.sunbeam.CRM.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<EmployeeResponseDto> getAllEmployees() {
        List<Users> users = userRepository.findByRoleAndEmployeeStatusNot(Role.EMPLOYEE, EmployeeStatus.DELETED);
        return users.stream()
                .map(user -> mapToDto(user))
                .collect(Collectors.toList());
    }

    private EmployeeResponseDto mapToDto(Users user) {
        if (user == null) return null;
        EmployeeResponseDto dto = modelMapper.map(user, EmployeeResponseDto.class);
        if (user.getCreatedAt() != null) {
            dto.setCreated_at(user.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));
        }
        if (user.getResignationApprovedBy() != null) {
            dto.setResignationApprovedByEmail(user.getResignationApprovedBy().getEmail());
        }
        if (user.getDeletedBy() != null) {
            dto.setDeletedByEmail(user.getDeletedBy().getEmail());
        }
        return dto;
    }
}
