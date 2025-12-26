package com.electro.controller.client;

import com.electro.constant.AppConstants;
import com.electro.constant.FieldName;
import com.electro.constant.ResourceName;
import com.electro.dto.ListResponse;
import com.electro.dto.client.ClientReviewRequest;
import com.electro.dto.client.ClientReviewResponse;
import com.electro.dto.client.ClientSimpleReviewResponse;
import com.electro.entity.review.Review;
import com.electro.exception.ResourceNotFoundException;
import com.electro.mapper.client.ClientReviewMapper;
import com.electro.repository.review.ReviewRepository;
import com.electro.config.security.UserDetailsImpl;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/client-api/reviews")
@AllArgsConstructor
@CrossOrigin(AppConstants.FRONTEND_HOST)
public class ClientReviewController {

    private static final int MAX_PAGE_SIZE = 50;
    private static final int APPROVED_STATUS = 2;

    private final ReviewRepository reviewRepository;
    private final ClientReviewMapper clientReviewMapper;
    private final EntityManager entityManager;

    /* ================= GET PUBLIC – CHỈ ĐÃ DUYỆT ================= */

    @GetMapping("/products/{productSlug}")
    public ResponseEntity<ListResponse<ClientSimpleReviewResponse>> getAllReviewsByProduct(
            @PathVariable String productSlug,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size
    ) {
        if (page < 1 || size < 1 || size > MAX_PAGE_SIZE) {
            return ResponseEntity.badRequest().build();
        }

        Page<Review> reviews =
                reviewRepository.findAllByProduct_SlugAndStatus(
                        productSlug,
                        APPROVED_STATUS,
                        PageRequest.of(page - 1, size)
                );

        return ResponseEntity.ok(
                ListResponse.of(
                        reviews.map(clientReviewMapper::entityToSimpleResponse).toList(),
                        reviews
                )
        );
    }

    /* ================= GET BY USER ================= */

    @GetMapping
    public ResponseEntity<ListResponse<ClientReviewResponse>> getAllReviewsByUser(
            Authentication authentication,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size
    ) {
        if (page < 1 || size < 1 || size > MAX_PAGE_SIZE) {
            return ResponseEntity.badRequest().build();
        }

        Page<Review> reviews =
                reviewRepository.findAllByUser_Username(
                        authentication.getName(),
                        PageRequest.of(page - 1, size)
                );

        return ResponseEntity.ok(
                ListResponse.of(
                        reviews.map(clientReviewMapper::entityToResponse).toList(),
                        reviews
                )
        );
    }

    /* ================= CREATE ================= */

    @PostMapping
    public ResponseEntity<ClientReviewResponse> createReview(
            Authentication authentication,
            @Valid @RequestBody ClientReviewRequest request
    ) {
        UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();

        Review entity = clientReviewMapper.requestToEntity(request);

        entity.setUser(
                entityManager.getReference(
                        com.electro.entity.authentication.User.class,
                        user.getId()
                )
        );

        Review saved = reviewRepository.save(entity);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clientReviewMapper.entityToResponse(saved));
    }

    /* ================= UPDATE – OWNER ONLY ================= */

    @PutMapping("/{id}")
    public ResponseEntity<ClientReviewResponse> updateReview(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody ClientReviewRequest request
    ) {
        UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();

        Review review =
                reviewRepository.findByIdAndUser_Id(id, user.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        ResourceName.REVIEW,
                                        FieldName.ID,
                                        id
                                )
                        );

        Review updated =
                reviewRepository.save(
                        clientReviewMapper.partialUpdate(review, request)
                );

        return ResponseEntity.ok(
                clientReviewMapper.entityToResponse(updated)
        );
    }

    /* ================= DELETE – OWNER ONLY ================= */

    @DeleteMapping
    public ResponseEntity<Void> deleteReviews(
            Authentication authentication,
            @RequestBody List<Long> ids
    ) {
        UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();

        ids.forEach(id ->
                reviewRepository.findByIdAndUser_Id(id, user.getId())
                        .ifPresent(reviewRepository::delete)
        );

        return ResponseEntity.noContent().build();
    }
}
