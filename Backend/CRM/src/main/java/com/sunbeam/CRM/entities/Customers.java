package com.sunbeam.CRM.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name="customers")
@Getter
@Setter
@NoArgsConstructor
@AttributeOverride(name="id" , column=@Column(name="customer_id"))
public class Customers extends BaseClass {

    @Column(length=10,nullable = false,unique = true)
    private String phone;


    public Customers(String name, String email, String phone) {
        super(name, email);
        this.phone = phone;
    }

}
