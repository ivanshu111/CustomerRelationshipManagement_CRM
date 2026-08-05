package com.sunbeam.CRM.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmailRequestDto {
    private String to;
    private String subject;
    private String body;
    private boolean isHtml;
}
