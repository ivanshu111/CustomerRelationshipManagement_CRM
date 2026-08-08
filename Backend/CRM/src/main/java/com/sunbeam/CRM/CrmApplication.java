package com.sunbeam.CRM;

import com.sunbeam.CRM.entities.Role;
import com.sunbeam.CRM.entities.Users;
import com.sunbeam.CRM.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableScheduling
@SpringBootApplication
public class CrmApplication {

	public static void main(String[] args) {SpringApplication.run(CrmApplication.class, args);}

	@Bean
	CommandLineRunner init(UserRepository userRepository,
	                       PasswordEncoder passwordEncoder) {

		return args -> {

			if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {

				Users admin = new Users();

				admin.setName("System Admin");          // Required
				admin.setEmail("admin@gmail.com");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setRole(Role.ADMIN);

				userRepository.save(admin);

				System.out.println("Default admin created.");
			}

		};

	}

}
