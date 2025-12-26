package com.electro.controller.promotion;

import com.electro.constant.AppConstants;
import com.electro.dto.promotion.PromotionCheckingResponse;
import com.electro.service.promotion.PromotionService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.time.Instant;

@RestController
@RequestMapping("/api/promotions")
@AllArgsConstructor
@CrossOrigin(AppConstants.FRONTEND_HOST)
@Validated
public class PromotionController {

    private PromotionService promotionService;

    /**
     * SECURITY HARDENING:
     * - Input validation
     * - Prevent parameter tampering
     * - Prevent invalid date range
     */
    @GetMapping("/checking")
    public ResponseEntity<PromotionCheckingResponse> checkCanCreatePromotionForProduct(

            @RequestParam
            @NotNull(message = "Product ID is required")
            @Min(value = 1, message = "Product ID must be greater than 0")
            Long productId,

            @RequestParam
            @NotNull(message = "Start date is required")
            Instant startDate,

            @RequestParam
            @NotNull(message = "End date is required")
            Instant endDate
    ) {

        if (startDate.isAfter(endDate)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start date must be before end date"
            );
        }

        boolean promotionable =
                promotionService.checkCanCreatePromotionForProduct(
                        productId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(
                new PromotionCheckingResponse(promotionable)
        );
    }
}
