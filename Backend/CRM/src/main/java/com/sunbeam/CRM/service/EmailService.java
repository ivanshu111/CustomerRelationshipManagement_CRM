package com.sunbeam.CRM.service;

import com.sunbeam.CRM.entities.Customers;
import com.sunbeam.CRM.entities.Interaction;
import com.sunbeam.CRM.entities.Users;

import java.util.List;


public interface EmailService {
    void sendCustomerReassignmentEmail(Customers customer, Users oldOwner, Users newOwner);

    void sendTodayFollowUpReminder(Users employee, List<Interaction> employeeInteractions);




}