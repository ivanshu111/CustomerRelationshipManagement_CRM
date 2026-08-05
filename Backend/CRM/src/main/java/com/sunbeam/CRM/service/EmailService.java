package com.sunbeam.CRM.service;

import com.sunbeam.CRM.entities.Customers;
import com.sunbeam.CRM.entities.Interaction;
import com.sunbeam.CRM.entities.Users;

import java.time.LocalDate;
import java.util.List;


public interface EmailService {
    void sendCustomerReassignmentEmail(Customers customer, Users oldOwner, Users newOwner);

    void sendTodayFollowUpReminder(Users employee, List<Interaction> employeeInteractions);

    void sendResignationRejectedEmail(Users employee, LocalDate resignationDate);

     void sendResignationApprovedEmail(Users employee, LocalDate resignationDate, LocalDate lastWorkingDate);

}