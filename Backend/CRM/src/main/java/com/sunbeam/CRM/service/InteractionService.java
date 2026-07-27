package com.sunbeam.CRM.service;

import java.util.List;

import com.sunbeam.CRM.dto.InteractionRequestDto;
import com.sunbeam.CRM.dto.InteractionResponseDto;

public interface InteractionService {
    
     InteractionResponseDto createInteraction(InteractionRequestDto dto);
    List<InteractionResponseDto> getCustomerInteractions(Integer customerId);
}
