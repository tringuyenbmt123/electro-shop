package com.electro.repository.review;

import com.electro.entity.review.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository
        extends JpaRepository<Review, Long>,
                JpaSpecificationExecutor<Review> {

    /* ================= PUBLIC – CHỈ REVIEW ĐÃ DUYỆT ================= */

    Page<Review> findAllByProduct_SlugAndStatus(
            String productSlug,
            Integer status,
            Pageable pageable
    );

    /* ================= USER – REVIEW CỦA CHÍNH MÌNH ================= */

    Page<Review> findAllByUser_Username(
            String username,
            Pageable pageable
    );

    Optional<Review> findByIdAndUser_Id(Long id, Long userId);

    /* ================= THỐNG KÊ ================= */

    @Query("SELECT COALESCE(CEILING(AVG(r.ratingScore)), 0) " +
           "FROM Review r WHERE r.product.id = :productId AND r.status = 2")
    int findAverageRatingScoreByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r.id) " +
           "FROM Review r WHERE r.product.id = :productId AND r.status = 2")
    int countByProductId(@Param("productId") Long productId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END " +
           "FROM Review r JOIN r.user u " +
           "WHERE r.product.id = :productId AND u.username = :username")
    boolean existsByProductIdAndUsername(
            @Param("productId") Long productId,
            @Param("username") String username
    );

    @Query("SELECT COUNT(r.id) FROM Review r")
    int countByReviewId();
}
