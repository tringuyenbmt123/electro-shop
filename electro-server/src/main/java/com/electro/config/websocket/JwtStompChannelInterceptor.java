package com.electro.config.websocket;

import com.electro.config.security.JwtUtils;
import com.electro.config.security.UserDetailsServiceImpl;
import com.electro.constant.SecurityConstants;
import com.electro.repository.chat.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class JwtStompChannelInterceptor implements ChannelInterceptor {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String CHAT_RECEIVE_PREFIX = "/chat/receive/";
    private static final String CHAT_SEND_PREFIX = "/chat/send/";

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;
    private final RoomRepository roomRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        Authentication authentication = (Authentication) accessor.getUser();

        if (command == StompCommand.CONNECT) {
            authentication = authenticate(accessor);
            accessor.setUser(authentication);
        } else if (command == StompCommand.SUBSCRIBE || command == StompCommand.SEND) {
            if (authentication == null || !authentication.isAuthenticated()) {
                authentication = authenticateIfPresent(accessor);
                if (authentication != null) {
                    accessor.setUser(authentication);
                }
            }

            if (authentication == null || !authentication.isAuthenticated()) {
                throw new AccessDeniedException("Full authentication is required to access this resource");
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);

            if (command == StompCommand.SUBSCRIBE) {
                authorizeSubscribe(authentication, accessor.getDestination());
            } else {
                authorizeSend(authentication, accessor.getDestination());
            }
        }

        return message;
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        SecurityContextHolder.clearContext();
    }

    private Authentication authenticateIfPresent(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader(AUTHORIZATION_HEADER);
        if (!StringUtils.hasText(header)) {
            return null;
        }
        return authenticate(accessor);
    }

    private Authentication authenticate(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader(AUTHORIZATION_HEADER);
        if (!StringUtils.hasText(header) || !header.startsWith(BEARER_PREFIX)) {
            throw new AccessDeniedException("Missing or invalid Authorization header");
        }

        String token = header.substring(BEARER_PREFIX.length());
        if (!jwtUtils.validateJwtToken(token)) {
            throw new AccessDeniedException("Invalid JWT token");
        }

        String username = jwtUtils.getUsernameFromJwt(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    private void authorizeSubscribe(Authentication authentication, String destination) {
        if (!StringUtils.hasText(destination)) {
            return;
        }
        if (!destination.startsWith(CHAT_RECEIVE_PREFIX)) {
            return;
        }

        long roomId = parseId(destination, CHAT_RECEIVE_PREFIX);
        if (!isStaff(authentication) && !roomRepository.existsByIdAndUser_Username(roomId, authentication.getName())) {
            throw new AccessDeniedException("Not allowed to subscribe to this room");
        }
    }

    private void authorizeSend(Authentication authentication, String destination) {
        if (!StringUtils.hasText(destination)) {
            return;
        }
        if (!destination.startsWith(CHAT_SEND_PREFIX)) {
            return;
        }

        long roomId = parseId(destination, CHAT_SEND_PREFIX);
        if (!isStaff(authentication) && !roomRepository.existsByIdAndUser_Username(roomId, authentication.getName())) {
            throw new AccessDeniedException("Not allowed to send to this room");
        }
    }

    private boolean isStaff(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        SecurityConstants.Role.ADMIN.equals(authority.getAuthority())
                                || SecurityConstants.Role.EMPLOYEE.equals(authority.getAuthority()));
    }

    private long parseId(String destination, String prefix) {
        String idPart = destination.substring(prefix.length());
        try {
            return Long.parseLong(idPart);
        } catch (NumberFormatException ex) {
            throw new AccessDeniedException("Invalid destination");
        }
    }
}

