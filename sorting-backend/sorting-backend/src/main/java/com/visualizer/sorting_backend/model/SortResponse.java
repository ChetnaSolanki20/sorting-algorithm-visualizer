package com.visualizer.sorting_backend.model;

import java.util.List;

public class SortResponse {
    private List<SortStep> steps;

    public SortResponse() {
    }

    public SortResponse(List<SortStep> steps) {
        this.steps = steps;
    }

    public List<SortStep> getSteps() {
        return steps;
    }

    public void setSteps(List<SortStep> steps) {
        this.steps = steps;
    }
}