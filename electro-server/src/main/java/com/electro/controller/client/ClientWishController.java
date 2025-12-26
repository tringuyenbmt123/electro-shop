package com.electro.controller.client;

import com.electro.constant.AppConstants;
import com.electro.constant.FieldName;
import com.electro.constant.ResourceName;
import com.electro.dto.ListResponse;
import com.electro.dto.client.ClientWishRequest;
import com.electro.dto.client.ClientWishResponse;
import com.electro.entity.authentication.User;
import com.electro.entity.client.Wish;
import com.electro.exception.UnauthorizedException;
import com.electro.mapper.client.ClientWishMapper;
import com.electro.repository.authentication.UserRepository;
import com.electro.repository.client.WishRepository;
import com.electro.service.client.ClientWishService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/client-api/wishes")
@AllArgsConstructor
@CrossOrigin(AppConstants.FRONTEND_HOST)
public class ClientWishController {

    private final WishRepository wishRepository;
    private final UserRepository userRepository;
    private final ClientWishMapper clientWishMapper;
    private final ClientWishService clientWishService;

    // ================== GET ALL ==================
    @GetMapping
    public ResponseEntity<ListResponse<ClientWishResponse>> getAllWishes(
            Authentication authentication,
            @RequestParam(name = "page", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(name = "size", defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(name = "sort", defaultValue = AppConstants.DEFAULT_SORT) String sort,
            @RequestParam(name = "filter", required = false) @Nullable String filter
    ) {
        String username = authentication.getName();

        Page<Wish> wishes = wishRepository.findAllByUsername(
                username,
                sort,
                filter,
                PageRequest.of(page - 1, size)
        );

        List<ClientWishResponse> responses =
                wishes.map(clientWishMapper::entityToResponse).toList();

        return ResponseEntity.ok(ListResponse.of(responses, wishes));
    }

    // ================== CREATE ==================
    @PostMapping
    public ResponseEntity<ClientWishResponse> createWish(
            @RequestBody ClientWishRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();

        // 1. Check duplicate
        Optional<Wish> existingWish =
                wishRepository.findByUser_UsernameAndProduct_Id(
                        username,
                        request.getProductId()
                );

        if (existingWish.isPresent()) {
            throw new IllegalStateException("Duplicated wish");
        }

        // 2. Load user từ DB
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException(
                        ResourceName.USER,
                        FieldName.USERNAME,
                        username
                ));

        // 3. Map request → entity
        Wish entity = clientWishMapper.requestToEntity(request);

        // 4. Gán ownership
        entity.setUser(user);

        Wish saved = wishRepository.save(entity);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clientWishMapper.entityToResponse(saved));
    }

    // ================== DELETE ==================
    @DeleteMapping
    public ResponseEntity<Void> deleteWishes(
            @RequestBody List<Long> ids,
            Authentication authentication
    ) {
        String username = authentication.getName();

        clientWishService.deleteWishes(ids, username);

        return ResponseEntity.noContent().build();
    }
}
