package com.sunbeam.CRM.security;

import com.sunbeam.CRM.entities.EmployeeStatus;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Users user= userRepository.findByEmail(email)
                .orElseThrow(()-> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getEmployeeStatus() == EmployeeStatus.PENDING) {
            throw new org.springframework.security.authentication.DisabledException("Your account access request is pending administrator approval.");
        }
        if (user.getEmployeeStatus() == EmployeeStatus.DELETED) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        if (user.getEmployeeStatus() == EmployeeStatus.RESIGNED) {
            throw new org.springframework.security.authentication.DisabledException("User account is resigned.");
        }

        return UserDetailsImpl.build(user);
    }
}

