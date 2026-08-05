package com.sunbeam.CRM.dto;

public class EmailResponseDto {
    private boolean success;
    private String message;

    public EmailResponseDto() {
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
