package com.example.app.repository;

import com.example.app.domain.Region;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegionRepository extends JpaRepository<Region, Integer> {
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count

    Region findByRegionName(String regionName);
    Region findByRegionId(Integer regionId);

    // 리스트로 조회
    List<Region> findByRegionIdIn(List<Integer> regionIds);
    List<Region> findByRegionNameIn(List<String> regionNames);
}
