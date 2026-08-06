package com.sunbeam.CRM.scheduler;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.sunbeam.CRM.entities.Customers;
import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.CustomerRepository;
import com.sunbeam.CRM.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ResignationScheduler {

   private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @Scheduled(cron = "${crm.resignation.scheduler.cron}")
    @Transactional
    public void processResignations() {

        LocalDate today = LocalDate.now();

        List<Users> employees = userRepository
                .findByEmployeeStatusAndLastWorkingDateLessThanEqual(EmployeeStatus.NOTICE_PERIOD, today);

        for (Users employee : employees) {

            Users admin = employee.getResignationApprovedBy();

            employee.setEmployeeStatus(EmployeeStatus.RESIGNED);

            List<Customers> customers =
                    customerRepository.findByAssignedTo(employee);

            for (Customers customer : customers) {
                customer.setAssignedTo(admin);
            }

            customerRepository.saveAll(customers);

            userRepository.save(employee);
        }
    }
  
}
