package com.visualizer.sorting_backend.model;

public class SortStep {
    private String type;
    private int index1;
    private int index2;
    private int value;

    // Default Constructor (Required by Jackson for JSON mapping)
    public SortStep() {
    }

    // Constructor for COMPARE and SWAP
    public SortStep(String type, int index1, int index2) {
        this.type = type;
        this.index1 = index1;
        this.index2 = index2;
        this.value = -1;
    }

    // Constructor for OVERWRITE
    public SortStep(String type, int index1, int value, boolean isOverwrite) {
        this.type = type;
        this.index1 = index1;
        this.index2 = -1;
        this.value = value;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getIndex1() {
        return index1;
    }

    public void setIndex1(int index1) {
        this.index1 = index1;
    }

    public int getIndex2() {
        return index2;
    }

    public void setIndex2(int index2) {
        this.index2 = index2;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }
}