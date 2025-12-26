package com.electro.controller.client;

import com.electro.constant.AppConstants;
import com.electro.constant.FieldName;
import com.electro.constant.ResourceName;
import com.electro.dto.client.ClientCartRequest;
import com.electro.dto.client.ClientCartResponse;
import com.electro.dto.client.ClientCartVariantKeyRequest;
import com.electro.entity.cart.Cart;
import com.electro.entity.cart.CartVariant;
import com.electro.entity.cart.CartVariantKey;
import com.electro.entity.authentication.User;
import com.electro.exception.UnauthorizedException;
import com.electro.mapper.client.ClientCartMapper;
import com.electro.repository.cart.CartRepository;
import com.electro.repository.cart.CartVariantRepository;
import com.electro.repository.inventory.DocketVariantRepository;
import com.electro.repository.authentication.UserRepository;
import com.electro.utils.InventoryUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/client-api/carts")
@AllArgsConstructor
@CrossOrigin(origins = AppConstants.FRONTEND_HOST)
public class ClientCartController {

    private final CartRepository cartRepository;
    private final CartVariantRepository cartVariantRepository;
    private final ClientCartMapper clientCartMapper;
    private final DocketVariantRepository docketVariantRepository;
    private final UserRepository userRepository;

    // ================== GET CART ==================
    @GetMapping
    public ResponseEntity<ObjectNode> getCart(Authentication authentication) {
        String username = authentication.getName();
        ObjectMapper mapper = new ObjectMapper();

        ObjectNode response = cartRepository.findByUsername(username)
                .map(clientCartMapper::entityToResponse)
                .map(res -> mapper.convertValue(res, ObjectNode.class))
                .orElse(mapper.createObjectNode());

        return ResponseEntity.ok(response);
    }

    // ================== SAVE / UPDATE CART ==================
    @PostMapping
    public ResponseEntity<ClientCartResponse> saveCart(
            @RequestBody ClientCartRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();

        // 1. Lấy cart hiện tại của user (nếu có)
        Cart cart = cartRepository.findByUsername(username).orElse(null);

        // 2. Nếu client gửi cartId nhưng user chưa có cart → truy cập trái phép
        if (cart == null && request.getCartId() != null) {
            throw new UnauthorizedException(
                    ResourceName.CART,
                    FieldName.ID,
                    request.getCartId()
            );
        }

        // 3. Nếu chưa có cart → tạo cart mới
        if (cart == null) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new UnauthorizedException(
                                    ResourceName.USER,
                                    FieldName.USERNAME,
                                    username
                            )
                    );

            cart = new Cart();
            cart.setUser(user);
            cart.setStatus(1); // cart active
            cart = cartRepository.save(cart);
        }

        // 4. Nếu client gửi cartId → phải khớp cart của user
        if (request.getCartId() != null && !cart.getId().equals(request.getCartId())) {
            throw new UnauthorizedException(
                    ResourceName.CART,
                    FieldName.ID,
                    request.getCartId()
            );
        }

        // 5. Update cart items
        Cart updatedCart = clientCartMapper.partialUpdate(cart, request);

        // 6. Validate tồn kho
        for (CartVariant cartVariant : updatedCart.getCartVariants()) {
            int inventory = InventoryUtils
                    .calculateInventoryIndices(
                            docketVariantRepository.findByVariantId(
                                    cartVariant.getCartVariantKey().getVariantId()
                            )
                    )
                    .get("canBeSold");

            if (cartVariant.getQuantity() <= 0 || cartVariant.getQuantity() > inventory) {
                throw new IllegalArgumentException("Invalid variant quantity");
            }
        }

        // 7. Save
        Cart savedCart = cartRepository.save(updatedCart);
        return ResponseEntity.ok(clientCartMapper.entityToResponse(savedCart));
    }

    // ================== DELETE CART ITEMS ==================
    @DeleteMapping
    public ResponseEntity<Void> deleteCartItems(
            @RequestBody List<ClientCartVariantKeyRequest> idRequests,
            Authentication authentication
    ) {
        String username = authentication.getName();

        Cart userCart = cartRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UnauthorizedException(
                                ResourceName.CART,
                                FieldName.ID,
                                null
                        )
                );

        List<CartVariantKey> ids = idRequests.stream()
                .filter(req -> req.getCartId().equals(userCart.getId()))
                .map(req -> new CartVariantKey(req.getCartId(), req.getVariantId()))
                .collect(Collectors.toList());

        cartVariantRepository.deleteAllById(ids);
        return ResponseEntity.noContent().build();
    }
}
