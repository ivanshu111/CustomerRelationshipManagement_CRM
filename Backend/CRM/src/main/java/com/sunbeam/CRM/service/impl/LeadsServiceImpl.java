package com.sunbeam.CRM.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sunbeam.CRM.entities.LeadStatus;
import com.sunbeam.CRM.repository.LeadsRepository;
import com.sunbeam.CRM.service.LeadsService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LeadsServiceImpl implements LeadsService {
    private final LeadsRepository leadsRepository;

    @Override
    public long getLeadsCount() {
        return leadsRepository.count();
    }

    @Override
    public long getLeadsCountWithStatusClosed() {
       return leadsRepository.countByStatus(LeadStatus.CLOSED);
    }
}
