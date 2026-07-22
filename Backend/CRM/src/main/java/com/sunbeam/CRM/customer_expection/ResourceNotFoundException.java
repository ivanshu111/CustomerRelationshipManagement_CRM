package com.sunbeam.CRM.customer_expection;

public class ResourceNotFoundException extends RuntimeException{
    public ResourceNotFoundException(String mesg) { super(mesg);
    }
}
