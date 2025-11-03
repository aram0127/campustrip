package com.example.app.service;


import com.example.app.domain.Region;
import com.example.app.dto.RegionDTO;
import com.example.app.dto.RegionList;
import com.example.app.repository.RegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RegionService {
    private final RegionRepository regionRepository;

    @Autowired
    public RegionService(RegionRepository regionRepository) {
        this.regionRepository = regionRepository;
    }


    public List<Region> getAllRegions() {
        return regionRepository.findAll();
    }

    public List<RegionList> getAllRegionsGroupedByProvince() {
        List<RegionList> regionLists = new ArrayList<>();
        List<Region> regions = regionRepository.findAll();
        List<RegionDTO> regionDTOs = null;
        RegionList regionList = null;
        for(int i = 0; i < regions.size(); i++) {
            RegionDTO region = new RegionDTO(regions.get(i));
            if(region.getId() % 100 == 0) {
                if(regionDTOs != null) {
                    regionList.setRegions(regionDTOs);
                    regionLists.add(regionList);
                }
                regionList = new RegionList();
                regionList.setProvince(region.getName());
                regionDTOs = new ArrayList<>();
            } else {
                regionDTOs.add(region);
            }
        }
        if(regionDTOs != null) {
            regionList.setRegions(regionDTOs);
            regionLists.add(regionList);
        }
        return regionLists;
    }
}
