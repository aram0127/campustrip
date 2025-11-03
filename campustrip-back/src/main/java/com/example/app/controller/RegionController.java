package com.example.app.controller;

import com.example.app.domain.Region;
import com.example.app.dto.RegionList;
import com.example.app.service.RegionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/regions")
public class RegionController {
    private final RegionService regionService;

    @Autowired
    public RegionController(RegionService regionService) {
        this.regionService = regionService;
    }

    @GetMapping("/all")
    public List<RegionList> getAllRegions() {
        return regionService.getAllRegionsGroupedByProvince();
    }
}
