package com.sunbeam.CRM.service;

import com.sunbeam.CRM.entities.Customers;
import com.sunbeam.CRM.entities.Users;


public interface EmailService {
    void sendCustomerReassignmentEmail(Customers customer, Users oldOwner, Users newOwner);




}