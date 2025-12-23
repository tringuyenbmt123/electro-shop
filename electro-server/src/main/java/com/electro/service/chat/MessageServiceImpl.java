package com.electro.service.chat;

import com.electro.constant.FieldName;
import com.electro.constant.ResourceName;
import com.electro.constant.SearchFields;
import com.electro.dto.ListResponse;
import com.electro.dto.chat.MessageRequest;
import com.electro.dto.chat.MessageResponse;
import com.electro.entity.authentication.User;
import com.electro.entity.chat.Message;
import com.electro.exception.ResourceNotFoundException;
import com.electro.mapper.chat.MessageMapper;
import com.electro.repository.chat.RoomRepository;
import com.electro.repository.authentication.UserRepository;
import com.electro.repository.chat.MessageRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.Instant;
import java.util.List;

@Service
@AllArgsConstructor
public class MessageServiceImpl implements MessageService {

    private MessageRepository messageRepository;
    private RoomRepository roomRepository;
    private UserRepository userRepository;
    private MessageMapper messageMapper;

    @Override
    public ListResponse<MessageResponse> findAll(int page, int size, String sort, String filter, String search, boolean all) {
        return defaultFindAll(page, size, sort, filter, search, all, SearchFields.MESSAGE, messageRepository, messageMapper);
    }

    @Override
    public MessageResponse findById(Long id) {
        return defaultFindById(id, messageRepository, messageMapper, ResourceName.MESSAGE);
    }

    @Override
    public MessageResponse save(MessageRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Full authentication is required to access this resource");
        }

        if (request.getRoomId() == null) {
            throw new IllegalArgumentException("roomId is required");
        }

        String username = authentication.getName();

        // Customers can only send messages to their own room (prevent IDOR)
        boolean isCustomer = authentication.getAuthorities().stream()
                .anyMatch(authority -> "CUSTOMER".equals(authority.getAuthority()));
        if (isCustomer && !roomRepository.existsByIdAndUser_Username(request.getRoomId(), username)) {
            throw new ResourceNotFoundException(ResourceName.ROOM, FieldName.ID, request.getRoomId());
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        if (!roomRepository.existsById(request.getRoomId())) {
            throw new ResourceNotFoundException(ResourceName.ROOM, FieldName.ID, request.getRoomId());
        }

        Message message = new Message();
        message.setContent(request.getContent());
        message.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        message.setUser(user);
        message.setRoom(roomRepository.getById(request.getRoomId()));

        // (1) Save message
        Message messageAfterSave = messageRepository.save(message);

        // (2) Save room
        roomRepository.findById(request.getRoomId())
                .ifPresent(room -> {
                    room.setUpdatedAt(Instant.now());
                    room.setLastMessage(messageAfterSave);
                    roomRepository.save(room);
                });

        return messageMapper.entityToResponse(messageAfterSave);
    }

    @Override
    public MessageResponse save(Long id, MessageRequest request) {
        return defaultSave(id, request, messageRepository, messageMapper, ResourceName.MESSAGE);
    }

    @Override
    public void delete(Long id) {
        messageRepository.deleteById(id);
    }

    @Override
    public void delete(List<Long> ids) {
        messageRepository.deleteAllById(ids);
    }

}
