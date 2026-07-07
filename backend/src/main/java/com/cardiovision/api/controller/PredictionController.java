package com.cardiovision.api.controller;

import com.cardiovision.api.dto.ApiResponse;
import com.cardiovision.api.dto.PredictionDto;
import com.cardiovision.api.service.PredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@Tag(name = "Predictions", description = "Cardiac Risk Prediction APIs")
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping("/predict")
    @Operation(summary = "Run prediction", description = "Submit features for cardiac risk prediction")
    public ResponseEntity<ApiResponse.Success<PredictionDto.PredictResponse>> predict(
            @RequestBody PredictionDto.PredictRequest request) {
        return ResponseEntity.ok(ApiResponse.Success.<PredictionDto.PredictResponse>builder()
                .message("Prediction completed")
                .data(predictionService.predict(request))
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get prediction", description = "Get prediction result by ID")
    public ResponseEntity<ApiResponse.Success<PredictionDto.PredictResponse>> getPrediction(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.Success.<PredictionDto.PredictResponse>builder()
                .message("Prediction retrieved")
                .data(predictionService.getPrediction(id))
                .build());
    }

    @GetMapping("/history")
    @Operation(summary = "Get prediction history", description = "Get paginated prediction history")
    public ResponseEntity<ApiResponse.PagedResponse<Page<PredictionDto.PredictResponse>>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PredictionDto.PredictResponse> result = predictionService.getHistory(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.PagedResponse.<Page<PredictionDto.PredictResponse>>builder()
                .data(result)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build());
    }
}
