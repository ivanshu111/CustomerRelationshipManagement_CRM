package com.sunbeam.CRM.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="users")
@Getter
@Setter
@NoArgsConstructor
@AttributeOverride(name="id" , column=@Column(name="user_id"))
public class Users extends BaseClass{

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @JsonIgnore
    @OneToMany(mappedBy = "assignedTo")
    private List<Customers> customers;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_status", nullable = false)
    private EmployeeStatus employeeStatus = EmployeeStatus.ACTIVE;

    @Column(name = "resignation_reason")
    private String resignationReason;

    @Column(name = "resignation_requested_at")
    private LocalDateTime resignationRequestedAt;

    @Column(name = "last_working_date")
    private LocalDate lastWorkingDate;

    @Column(name = "resignation_approved_at")
    private LocalDateTime resignationApprovedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resignation_approved_by")
    private Users resignationApprovedBy;

    @Column(name = "blocked_reason")
    private String blockedReason;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt;

    @Column(name = "blocked_until")
    private LocalDateTime blockedUntil;

    @Column(name = "block_removal_requested", nullable = false)
    private boolean blockRemovalRequested = false;

    @Column(name = "block_removal_reason")
    private String blockRemovalReason;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private Users deletedBy;

    public boolean isCurrentlyBlocked() {
        if (this.employeeStatus == EmployeeStatus.BLOCKED) {
            if (this.blockedUntil == null) {
                return true;
            }
            return LocalDateTime.now().isBefore(this.blockedUntil);
        }
        return false;
    }
}
