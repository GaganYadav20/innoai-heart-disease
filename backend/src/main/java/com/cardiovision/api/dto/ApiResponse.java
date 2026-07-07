package com.cardiovision.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

public class ApiResponse {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Success<T> {
        @Builder.Default
        private boolean success = true;
        private String message;
        private T data;
        @Builder.Default
        private ZonedDateTime timestamp = ZonedDateTime.now();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Error {
        @Builder.Default
        private boolean success = false;
        private String message;
        private String error;
        private int status;
        @Builder.Default
        private ZonedDateTime timestamp = ZonedDateTime.now();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PagedResponse<T> {
        @Builder.Default
        private boolean success = true;
        private T data;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
