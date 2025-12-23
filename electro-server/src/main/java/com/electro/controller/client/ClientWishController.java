package com.electro.controller.client;

import com.electro.constant.AppConstants;
import com.electro.constant.FieldName;
import com.electro.constant.ResourceName;
import com.electro.dto.ListResponse;
import com.electro.dto.client.ClientWishRequest;
import com.electro.dto.client.ClientWishResponse;
import com.electro.entity.authentication.User;
import com.electro.entity.client.Wish;
import com.electro.exception.ResourceNotFoundException;
import com.electro.mapper.client.ClientWishMapper;
import com.electro.repository.authentication.UserRepository;
import com.electro.repository.client.WishRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/client-api/wishes")
@AllArgsConstructor
@CrossOrigin(AppConstants.FRONTEND_HOST)
public class ClientWishController {

    private WishRepository wishRepository;
    private ClientWishMapper clientWishMapper;
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ListResponse<ClientWishResponse>> getAllWishes(
            Authentication authentication,
            @RequestParam(name = "page", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(name = "size", defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(name = "sort", defaultValue = AppConstants.DEFAULT_SORT) String sort,
            @RequestParam(name = "filter", required = false) @Nullable String filter
    ) {
        String username = authentication.getName();
        Page<Wish> wishes = wishRepository.findAllByUsername(username, sort, filter, PageRequest.of(page - 1, size));
        List<ClientWishResponse> clientWishResponses = wishes.map(clientWishMapper::entityToResponse).toList();
        return ResponseEntity.status(HttpStatus.OK).body(ListResponse.of(clientWishResponses, wishes));
    }

    @PostMapping
    public ResponseEntity<ClientWishResponse> createWish(@RequestBody ClientWishRequest request,
                                                          Authentication authentication) throws Exception {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ResourceName.USER, FieldName.USERNAME, username));
        
        // Check if wish already exists for this user
        Optional<Wish> wishOpt = wishRepository.findByUser_IdAndProduct_Id(user.getId(), request.getProductId());

        if (wishOpt.isPresent()) {
            throw new Exception("Duplicated wish");
        } else {
            Wish entity = clientWishMapper.requestToEntity(request);
            // Set authenticated user - prevent IDOR
            entity.setUser(user);
            entity = wishRepository.save(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(clientWishMapper.entityToResponse(entity));
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteWishes(@RequestBody List<Long> ids, Authentication authentication) {
        String username = authentication.getName();
        // Only delete wishes belonging to the authenticated user - prevent IDOR
        List<Long> validIds = ids.stream()
                .map(wishRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .filter(wish -> wish.getUser().getUsername().equals(username))
                .map(Wish::getId)
                .collect(Collectors.toList());
        wishRepository.deleteAllById(validIds);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
