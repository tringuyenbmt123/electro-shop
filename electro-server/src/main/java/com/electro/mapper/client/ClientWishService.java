package com.electro.service.client;

import com.electro.repository.client.WishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientWishService {

    private final WishRepository wishRepository;

    @Transactional
    public void deleteWishes(List<Long> ids, String username) {
        wishRepository.deleteAllByIdInAndUser_Username(ids, username);
    }
}
