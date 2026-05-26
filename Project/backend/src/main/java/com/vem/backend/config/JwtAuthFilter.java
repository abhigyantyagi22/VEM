package com.vem.backend.config;

import com.vem.backend.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        
        try {
            System.err.println("[JwtAuthFilter] Processing request to: " + request.getRequestURI());
            System.err.println("[JwtAuthFilter] Authorization header: " + (authHeader != null ? "Present" : "Missing"));
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                System.err.println("[JwtAuthFilter] Token extracted successfully");
                username = jwtUtil.extractUsername(token);
                System.err.println("[JwtAuthFilter] Username extracted: " + username);
            } else {
                System.err.println("[JwtAuthFilter] No Bearer token found in Authorization header");
            }

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                System.err.println("[JwtAuthFilter] Loading UserDetails for: " + username);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                System.err.println("[JwtAuthFilter] UserDetails loaded, validating token...");
                if (jwtUtil.validateToken(token, userDetails)) {
                    System.err.println("[JwtAuthFilter] Token validated successfully");
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.err.println("[JwtAuthFilter] Authentication set in SecurityContext");
                } else {
                    System.err.println("[JwtAuthFilter] Token validation failed");
                }
            } else {
                System.err.println("[JwtAuthFilter] Skipping authentication: username=" + username + ", existing auth=" + (SecurityContextHolder.getContext().getAuthentication() != null));
            }
        } catch (Exception e) {
            // Log the error but don't stop filter chain
            System.err.println("[JwtAuthFilter] Exception occurred: " + e.getMessage());
            e.printStackTrace();
        }
        filterChain.doFilter(request, response);
    }
}
