package com.sunbeam.CRM.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BestEmployeeDto {

    private Integer id;
    private String name;
    private Double conversionRate;

    public BestEmployeeDto() {
    }

    public BestEmployeeDto(Integer id, String name, Double conversionRate) {
        this.id = id;
        this.name = name;
        this.conversionRate = conversionRate;
    }

}
