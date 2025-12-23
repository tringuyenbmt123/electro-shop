package com.electro.config.security;

import com.electro.constant.SecurityConstants;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(
//        securedEnabled = true,
//        jsr250Enabled = true,
        prePostEnabled = true)
@Order(1000)
@AllArgsConstructor
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    private UserDetailsServiceImpl userDetailsService;

    @Qualifier("handlerExceptionResolver")
    private HandlerExceptionResolver resolver;

    @Bean
    public AuthTokenFilter authenticationJwAuthTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, exception) -> resolver.resolveException(request, response, null, exception);
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, exception) -> resolver.resolveException(request, response, null, exception);
    }

    @Override
    protected void configure(AuthenticationManagerBuilder authenticationManagerBuilder) throws Exception {
        authenticationManagerBuilder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
                .cors()
                .and()
                .csrf()
                .disable()
                .exceptionHandling()
                .authenticationEntryPoint(authenticationEntryPoint())
                .accessDeniedHandler(accessDeniedHandler())
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                // Allow CORS preflight
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public authentication endpoints
                .antMatchers("/api/auth/login", "/api/auth/refresh-token", "/api/auth/registration/**",
                        "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                // Public address lookup endpoints (signup, shipping, etc.)
                .antMatchers(HttpMethod.GET, "/api/provinces/**", "/api/districts/**", "/api/wards/**").permitAll()
                // Public client browsing endpoints
                .antMatchers(org.springframework.http.HttpMethod.GET, 
                        "/client-api/products/**", 
                        "/client-api/categories/**", 
                        "/client-api/filters/**",
                        "/client-api/payment-methods/**",
                        "/client-api/reviews/products/**").permitAll()
                // Public image read (product images, avatars, etc.)
                .antMatchers(HttpMethod.GET, "/images/**").permitAll()
                // Public endpoints for SSL validation, docs, and default error handling
                .antMatchers(
                        "/",
                        "/error",
                        "/favicon.ico",
                        "/robots.txt",
                        "/.well-known/**",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/actuator/health"
                ).permitAll()
                // Public order callback endpoints
                .antMatchers("/client-api/orders/success", "/client-api/orders/cancel").permitAll()
                // Public SSE endpoint (will be validated by token)
                .antMatchers("/client-api/notifications/events").permitAll()
                // Admin backoffice - all /api/** endpoints require ADMIN or EMPLOYEE role
                .antMatchers("/api/**").hasAnyAuthority(SecurityConstants.Role.ADMIN, SecurityConstants.Role.EMPLOYEE)
                // Image management endpoints (upload/delete) require ADMIN or EMPLOYEE role
                .antMatchers("/images/**").hasAnyAuthority(SecurityConstants.Role.ADMIN, SecurityConstants.Role.EMPLOYEE)
                // Client authenticated area - all /client-api/** endpoints require CUSTOMER role
                .antMatchers("/client-api/**").hasAuthority(SecurityConstants.Role.CUSTOMER)
                // Require authentication for any other request
                .anyRequest().authenticated();

        http.addFilterBefore(authenticationJwAuthTokenFilter(), UsernamePasswordAuthenticationFilter.class);
    }

}
