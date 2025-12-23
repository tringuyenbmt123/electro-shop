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

    private ProductRepository productRepository;
    private ClientProductMapper clientProductMapper;

    public Wish requestToEntity(ClientWishRequest request) {
        Wish entity = new Wish();
        entity.setProduct(productRepository.getById(request.getProductId()));
        return entity;
    }

    public ClientWishResponse entityToResponse(Wish entity) {
        ClientWishResponse response = new ClientWishResponse();
        response.setWishId(entity.getId());
        response.setWishCreatedAt(entity.getCreatedAt());
        // TODO: Triển khai `saleable` cho productResponse ở đây
        response.setWishProduct(clientProductMapper.entityToListedResponse(entity.getProduct(), Collections.emptyList()));
        return response;
    }

}
