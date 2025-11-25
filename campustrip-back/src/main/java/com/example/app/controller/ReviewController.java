package com.example.app.controller;

import com.example.app.dto.ReviewDTO;
import com.example.app.service.ReviewService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/{id}")
    public ReviewDTO getReviewById(@PathVariable Integer id) {
        return reviewService.getReviewById(id);
    }
}
