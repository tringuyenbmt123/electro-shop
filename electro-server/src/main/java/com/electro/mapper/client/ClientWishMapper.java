package com.electro.mapper.client;

import com.electro.dto.client.ClientWishRequest;
import com.electro.dto.client.ClientWishResponse;
import com.electro.entity.client.Wish;
import com.electro.repository.product.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@AllArgsConstructor
public class ClientWishMapper {

    private final ProductRepository productRepository;
    private final ClientProductMapper clientProductMapper;

    /**
     * QUY TẮC AN TOÀN:
     * - KHÔNG lấy userId từ request
     * - User được set ở Controller từ Authentication
     */
    public Wish requestToEntity(ClientWishRequest request) {
        Wish entity = new Wish();

        // Spring Data JPA 2.x → dùng getById
        entity.setProduct(
                productRepository.getById(request.getProductId())
        );

        return entity;
    }

    public ClientWishResponse entityToResponse(Wish entity) {
        ClientWishResponse response = new ClientWishResponse();
        response.setWishId(entity.getId());
        response.setWishCreatedAt(entity.getCreatedAt());

        response.setWishProduct(
                clientProductMapper.entityToListedResponse(
                        entity.getProduct(),
                        Collections.emptyList()
                )
        );

        return response;
    }
}
