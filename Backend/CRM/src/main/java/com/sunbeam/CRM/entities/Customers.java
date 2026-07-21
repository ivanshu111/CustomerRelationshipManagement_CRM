package com.sunbeam.CRM.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;


@Entity
@Table(name="customers")
@Getter
@Setter
@NoArgsConstructor
@AttributeOverride(name="id" , column=@Column(name="customer_id"))
public class Customers extends BaseClass {

    @Column(length=10,nullable = false,unique = true)
    private String phone;

    // Many customers → one Employee
    //Many customers will have one employee
    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users assignedTo;

    // One customer → many interactions
    @JsonIgnore
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Interaction> interactions;

    // One customer → many leads
    @JsonIgnore
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Leads> leads;


    public Customers(String name, String email, String phone) {
        super(name, email);
        this.phone = phone;
    }

}
