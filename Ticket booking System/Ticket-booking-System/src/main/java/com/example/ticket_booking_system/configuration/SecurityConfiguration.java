package com.example.ticket_booking_system.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.ticket_booking_system.security.CustomUserDetailsService;
import com.example.ticket_booking_system.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfiguration {
	@Bean
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) {

		http.cors(cors -> {})
		.csrf(csrf -> csrf.disable());
		
		http.sessionManagement(session -> session
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
//		  http.authorizeHttpRequests(auth -> auth
//
//	                // Public authentication endpoints
//	                .requestMatchers(
//	                    "/api/v1/auth/register",
//	                    "/api/v1/auth/login",
//	                    "/swagger-ui/**",
//	                    "/v3/api-docs/**"
//	                ).permitAll()
//
//	                // Public GET endpoints
//	                .requestMatchers(
//	                    HttpMethod.GET,
//	                    "/api/v1/movies",
//	                    "/api/v1/movies/**",
//	                    "/api/v1/theatres",
//	                    "/api/v1/theatres/**",
//	                    "/api/v1/shows",
//	                    "/api/v1/shows/**"
//	                ).permitAll()
//
//	                // Admin: Get all users
//	                .requestMatchers(
//	                    HttpMethod.GET,
//	                    "/api/v1/users"
//	                ).hasRole("ADMIN")
//
//	                // Authenticated user: Own profile
//	                .requestMatchers(
//	                    "/api/v1/users/me"
//	                ).hasAnyRole("CUSTOMER", "ADMIN")
//
//	                // Admin: User management
//	                .requestMatchers(
//	                    "/api/v1/users/**"
//	                ).hasRole("ADMIN")
//
//	                // Admin: Manage movies
//	                .requestMatchers(
//	                    "/api/v1/movies/**"
//	                ).hasRole("ADMIN")
//
//	                // Admin: Manage theatres
//	                .requestMatchers(
//	                    "/api/v1/theatres/**"
//	                ).hasRole("ADMIN")
//
//	                // Admin: Manage shows
//	                .requestMatchers(
//	                    "/api/v1/shows/**"
//	                ).hasRole("ADMIN")
//
//	                // Customer and Admin: Bookings
//	                .requestMatchers(
//	                    "/api/v1/bookings/**"
//	                ).hasAnyRole("CUSTOMER", "ADMIN")
//
//	                // All remaining endpoints require authentication
//	                .anyRequest().authenticated()
//	            )

	           http.addFilterBefore(
	                jwtAuthenticationFilter,
	                UsernamePasswordAuthenticationFilter.class
	            );

	        return http.build();
	}

	@Bean
	public AuthenticationManager authenticationManager(
			AuthenticationConfiguration configuration) {
		return configuration.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	public AuthenticationProvider authenticationProvider(
			PasswordEncoder passwordEncoder, 
			CustomUserDetailsService userDetailsService) {
		DaoAuthenticationProvider dao = 
				new DaoAuthenticationProvider(userDetailsService);
		dao.setPasswordEncoder(passwordEncoder);
		return dao;
	}
}