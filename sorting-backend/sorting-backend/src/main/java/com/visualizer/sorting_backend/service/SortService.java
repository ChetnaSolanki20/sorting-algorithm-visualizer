package com.visualizer.sorting_backend.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.visualizer.sorting_backend.model.SortStep;

@Service
public class SortService {

    public List<SortStep> generateSteps(String algorithm, int[] inputArr) {
        int[] arr = Arrays.copyOf(inputArr, inputArr.length);
        List<SortStep> steps = new ArrayList<>();

        if (algorithm == null) algorithm = "BUBBLE";

        switch (algorithm.toUpperCase()) {
            case "BUBBLE":
                bubbleSort(arr, steps);
                break;
            case "SELECTION":
                selectionSort(arr, steps);
                break;
            case "INSERTION":
                insertionSort(arr, steps);
                break;
            case "SHELL":
                shellSort(arr, steps);
                break;
            case "QUICK":
                quickSort(arr, 0, arr.length - 1, steps);
                break;
            case "MERGE":
                mergeSort(arr, 0, arr.length - 1, steps);
                break;
            case "HEAP":
                heapSort(arr, steps);
                break;
            case "RADIX":
                radixSort(arr, steps);
                break;
            case "BUCKET":
                bucketSort(arr, steps);
                break;
            default:
                bubbleSort(arr, steps);
                break;
        }

        return steps;
    }

    private void bubbleSort(int[] arr, List<SortStep> steps) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                steps.add(new SortStep("COMPARE", j, j + 1));
                if (arr[j] > arr[j + 1]) {
                    steps.add(new SortStep("SWAP", j, j + 1));
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    private void selectionSort(int[] arr, List<SortStep> steps) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                steps.add(new SortStep("COMPARE", minIdx, j));
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            if (minIdx != i) {
                steps.add(new SortStep("SWAP", i, minIdx));
                int temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            }
        }
    }

    private void insertionSort(int[] arr, List<SortStep> steps) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                steps.add(new SortStep("COMPARE", j, j + 1));
                steps.add(new SortStep("OVERWRITE", j + 1, arr[j], true));
                arr[j + 1] = arr[j];
                j--;
            }
            steps.add(new SortStep("OVERWRITE", j + 1, key, true));
            arr[j + 1] = key;
        }
    }

    private void shellSort(int[] arr, List<SortStep> steps) {
        int n = arr.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = arr[i];
                int j = i;
                while (j >= gap) {
                    steps.add(new SortStep("COMPARE", j - gap, j));
                    if (arr[j - gap] > temp) {
                        steps.add(new SortStep("OVERWRITE", j, arr[j - gap], true));
                        arr[j] = arr[j - gap];
                        j -= gap;
                    } else break;
                }
                steps.add(new SortStep("OVERWRITE", j, temp, true));
                arr[j] = temp;
            }
        }
    }

    private void quickSort(int[] arr, int lo, int hi, List<SortStep> steps) {
        if (lo >= hi) return;
        int pivot = arr[hi];
        int i = lo - 1;
        for (int j = lo; j < hi; j++) {
            steps.add(new SortStep("COMPARE", j, hi));
            if (arr[j] < pivot) {
                i++;
                if (i != j) {
                    steps.add(new SortStep("SWAP", i, j));
                    int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
                }
            }
        }
        if (i + 1 != hi) {
            steps.add(new SortStep("SWAP", i + 1, hi));
            int t = arr[i + 1]; arr[i + 1] = arr[hi]; arr[hi] = t;
        }
        int p = i + 1;
        quickSort(arr, lo, p - 1, steps);
        quickSort(arr, p + 1, hi, steps);
    }

    private void mergeSort(int[] arr, int l, int r, List<SortStep> steps) {
        if (l >= r) return;
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m, steps);
        mergeSort(arr, m + 1, r, steps);

        int[] aux = Arrays.copyOf(arr, arr.length);
        int i = l, j = m + 1, k = l;

        while (i <= m && j <= r) {
            steps.add(new SortStep("COMPARE", i, j));
            if (aux[i] <= aux[j]) {
                steps.add(new SortStep("OVERWRITE", k, aux[i], true));
                arr[k++] = aux[i++];
            } else {
                steps.add(new SortStep("OVERWRITE", k, aux[j], true));
                arr[k++] = aux[j++];
            }
        }
        while (i <= m) {
            steps.add(new SortStep("COMPARE", i, -1));
            steps.add(new SortStep("OVERWRITE", k, aux[i], true));
            arr[k++] = aux[i++];
        }
        while (j <= r) {
            steps.add(new SortStep("COMPARE", j, -1));
            steps.add(new SortStep("OVERWRITE", k, aux[j], true));
            arr[k++] = aux[j++];
        }
    }

    private void heapSort(int[] arr, List<SortStep> steps) {
        int n = arr.length;
        for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i, steps);
        for (int i = n - 1; i > 0; i--) {
            steps.add(new SortStep("SWAP", 0, i));
            int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
            heapify(arr, i, 0, steps);
        }
    }

    private void heapify(int[] arr, int n, int i, List<SortStep> steps) {
        int largest = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;

        if (l < n) {
            steps.add(new SortStep("COMPARE", l, largest));
            if (arr[l] > arr[largest]) largest = l;
        }
        if (r < n) {
            steps.add(new SortStep("COMPARE", r, largest));
            if (arr[r] > arr[largest]) largest = r;
        }
        if (largest != i) {
            steps.add(new SortStep("SWAP", i, largest));
            int swap = arr[i]; arr[i] = arr[largest]; arr[largest] = swap;
            heapify(arr, n, largest, steps);
        }
    }

    private void radixSort(int[] arr, List<SortStep> steps) {
        int max = Arrays.stream(arr).max().orElse(1);
        for (int exp = 1; max / exp > 0; exp *= 10) {
            int n = arr.length;
            int[] output = new int[n];
            int[] count = new int[10];

            for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
            for (int i = 1; i < 10; i++) count[i] += count[i - 1];

            for (int i = n - 1; i >= 0; i--) {
                int digit = (arr[i] / exp) % 10;
                output[count[digit] - 1] = arr[i];
                count[digit]--;
            }

            for (int i = 0; i < n; i++) {
                arr[i] = output[i];
                steps.add(new SortStep("OVERWRITE", i, output[i], true));
            }
        }
    }

    private void bucketSort(int[] arr, List<SortStep> steps) {
        int n = arr.length;
        if (n <= 0) return;
        int max = Arrays.stream(arr).max().orElse(1);
        int min = Arrays.stream(arr).min().orElse(0);
        int bucketCount = Math.max(1, Math.min(10, n));
        double range = (double) (max - min) / bucketCount;
        if (range == 0) range = 1;

        List<List<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i < bucketCount; i++) buckets.add(new ArrayList<>());

        for (int val : arr) {
            int idx = (int) ((val - min) / range);
            if (idx >= bucketCount) idx = bucketCount - 1;
            buckets.get(idx).add(val);
        }

        int k = 0;
        for (List<Integer> bucket : buckets) {
            for (int i = 1; i < bucket.size(); i++) {
                int key = bucket.get(i);
                int j = i - 1;
                while (j >= 0 && bucket.get(j) > key) {
                    bucket.set(j + 1, bucket.get(j));
                    j--;
                }
                bucket.set(j + 1, key);
            }
            for (int val : bucket) {
                if (k > 0) steps.add(new SortStep("COMPARE", k - 1, k));
                steps.add(new SortStep("OVERWRITE", k, val, true));
                arr[k++] = val;
            }
        }
    }
}