package com.sunbeam.CRM.service;

import com.sunbeam.CRM.dto.RegisterRequestDto;
import com.sunbeam.CRM.dto.UserResponseDto;

public interface AuthService {
    void register(RegisterRequestDto registerRequestDto);

    UserResponseDto getProfile();

    void requestAccess(RegisterRequestDto registerRequestDto);
}
