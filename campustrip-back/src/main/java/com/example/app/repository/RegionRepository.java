package com.example.app.repository;

import com.example.app.domain.Region;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Integer> {
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count

    Region findByRegionName(String regionName);

}
