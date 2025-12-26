package com.electro.controller.client;

import com.electro.constant.AppConstants;
import com.electro.constant.FieldName;
import com.electro.constant.ResourceName;
import com.electro.dto.ListResponse;
import com.electro.dto.client.ClientListedProductResponse;
import com.electro.dto.client.ClientProductResponse;
import com.electro.entity.BaseEntity;
import com.electro.entity.product.Product;
import com.electro.exception.ResourceNotFoundException;
import com.electro.mapper.client.ClientProductMapper;
import com.electro.projection.inventory.SimpleProductInventory;
import com.electro.repository.ProjectionRepository;
import com.electro.repository.product.ProductRepository;
import com.electro.repository.review.ReviewRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/client-api/products")
@AllArgsConstructor
@CrossOrigin(AppConstants.FRONTEND_HOST)
public class ClientProductController {

    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_FILTER_LENGTH = 200;
    private static final int MAX_SEARCH_LENGTH = 100;

    private final ProductRepository productRepository;
    private final ProjectionRepository projectionRepository;
    private final ClientProductMapper clientProductMapper;
    private final ReviewRepository reviewRepository;

    /* ========================== LIST PRODUCTS ========================== */

    @GetMapping
    public ResponseEntity<ListResponse<ClientListedProductResponse>> getAllProducts(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(required = false) @Nullable String filter,
            @RequestParam(required = false) @Nullable String sort,
            @RequestParam(required = false) @Nullable String search,
            @RequestParam(defaultValue = "false") boolean saleable,
            @RequestParam(defaultValue = "false") boolean newable
    ) {

        /* ================== VALIDATION ================== */

        if (page < 1 || size < 1 || size > MAX_PAGE_SIZE) {
            return ResponseEntity.badRequest().build();
        }

        if (filter != null && filter.length() > MAX_FILTER_LENGTH) {
            return ResponseEntity.badRequest().build();
        }

        if (search != null && search.length() > MAX_SEARCH_LENGTH) {
            return ResponseEntity.badRequest().build();
        }

        if (sort != null && !sort.matches("^[a-zA-Z0-9_,]+$")) {
            return ResponseEntity.badRequest().build();
        }

        /* ================================================= */

        // Chuẩn hóa search → RSQL an toàn
        String safeSearchFilter = normalizeSearchToRsql(search);

        // Gộp filter + search
        String finalFilter;
        if (filter != null && safeSearchFilter != null) {
            finalFilter = filter + ";" + safeSearchFilter;
        } else if (filter != null) {
            finalFilter = filter;
        } else {
            finalFilter = safeSearchFilter;
        }

        Pageable pageable = PageRequest.of(page - 1, size);

        Page<Product> products = productRepository.findByParams(
                finalFilter,
                sort,
                null,   // KHÔNG truyền search thô
                saleable,
                newable,
                pageable
        );

        List<Long> productIds = products.map(Product::getId).toList();
        List<SimpleProductInventory> inventories =
                projectionRepository.findSimpleProductInventories(productIds);

        List<ClientListedProductResponse> responses = products
                .map(p -> clientProductMapper.entityToListedResponse(p, inventories))
                .toList();

        return ResponseEntity.ok(ListResponse.of(responses, products));
    }

    /* ========================== PRODUCT DETAIL ========================== */

    @GetMapping("/{slug}")
    public ResponseEntity<ClientProductResponse> getProduct(@PathVariable String slug) {

        if (!slug.matches("^[a-z0-9-]{1,100}$")) {
            return ResponseEntity.badRequest().build();
        }

        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ResourceName.PRODUCT,
                                FieldName.SLUG,
                                slug
                        )
                );

        List<SimpleProductInventory> inventories =
                projectionRepository.findSimpleProductInventories(List.of(product.getId()));

        int averageRatingScore =
                reviewRepository.findAverageRatingScoreByProductId(product.getId());
        int countReviews =
                reviewRepository.countByProductId(product.getId());

        Page<Product> relatedProducts = productRepository.findByParams(
                String.format(
                        "category.id==%s;id!=%s",
                        Optional.ofNullable(product.getCategory())
                                .map(BaseEntity::getId)
                                .orElse(0L),
                        product.getId()
                ),
                "random",
                null,
                false,
                false,
                PageRequest.of(0, 4)
        );

        List<Long> relatedIds = relatedProducts.map(Product::getId).toList();
        List<SimpleProductInventory> relatedInventories =
                projectionRepository.findSimpleProductInventories(relatedIds);

        List<ClientListedProductResponse> relatedResponses =
                relatedProducts
                        .map(p -> clientProductMapper.entityToListedResponse(p, relatedInventories))
                        .toList();

        ClientProductResponse response =
                clientProductMapper.entityToResponse(
                        product,
                        inventories,
                        averageRatingScore,
                        countReviews,
                        relatedResponses
                );

        return ResponseEntity.ok(response);
    }

    /* ========================== PRIVATE HELPERS ========================== */

    /**
     * Chuẩn hóa search keyword → RSQL an toàn
     * - Search hợp lệ → tìm theo name / slug
     * - Search KHÔNG hợp lệ → trả danh sách rỗng
     */
    private String normalizeSearchToRsql(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }

        // Không hợp lệ → ép kết quả rỗng
        if (!search.matches("^[\\p{L}0-9\\s]+$")) {
            return "id==0";
        }

        String keyword = search.trim();

        return String.format(
                "name==*%s*,slug==*%s*",
                keyword,
                keyword
        );
    }
}
