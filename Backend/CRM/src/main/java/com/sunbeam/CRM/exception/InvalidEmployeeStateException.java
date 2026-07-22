package com.sunbeam.CRM.exception;

public class InvalidEmployeeStateException extends RuntimeException{
    public InvalidEmployeeStateException(String message){
        super(message);
    }
}
