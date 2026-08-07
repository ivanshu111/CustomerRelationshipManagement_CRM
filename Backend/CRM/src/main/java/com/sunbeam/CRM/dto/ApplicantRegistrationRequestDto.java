package com.sunbeam.CRM.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicantRegistrationRequestDto {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Answer 1 is required")
    private String answer1;

    @NotBlank(message = "Answer 2 is required")
    private String answer2;

    @NotBlank(message = "Answer 3 is required")
    private String answer3;

    @NotBlank(message = "Answer 4 is required")
    private String answer4;
}