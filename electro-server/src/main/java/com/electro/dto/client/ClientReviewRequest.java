package com.electro.dto.client;

import lombok.Data;
import lombok.experimental.Accessors;

import javax.validation.constraints.*;

@Data
@Accessors(chain = true)
public class ClientReviewRequest {

    @NotNull
    @Positive
    private Long productId;

    @NotBlank
    @Size(max = 1000)
    private String content;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer ratingScore;
}
