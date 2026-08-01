package com.visualizer.sorting_backend.controller;

import com.visualizer.sorting_backend.model.SortRequest;
import com.visualizer.sorting_backend.model.SortResponse;
import com.visualizer.sorting_backend.model.SortStep;
import com.visualizer.sorting_backend.service.SortService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allows requests from your frontend JavaScript
public class SortController {

    private final SortService sortService;

    // Constructor Injection
    public SortController(SortService sortService) {
        this.sortService = sortService;
    }

    @PostMapping("/sort")
    public SortResponse processSorting(@RequestBody SortRequest request) {
        List<SortStep> steps = sortService.generateSteps(
            request.getAlgorithm(), 
            request.getArray()
        );
        return new SortResponse(steps);
    }
}