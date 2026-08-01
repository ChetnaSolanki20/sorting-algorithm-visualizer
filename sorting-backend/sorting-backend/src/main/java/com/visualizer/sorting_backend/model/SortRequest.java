package com.visualizer.sorting_backend.model;

public class SortRequest {
    private String algorithm;
    private int[] array;

    public SortRequest() {
    }

    public SortRequest(String algorithm, int[] array) {
        this.algorithm = algorithm;
        this.array = array;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public int[] getArray() {
        return array;
    }

    public void setArray(int[] array) {
        this.array = array;
    }
}