package com.example.app.dto;

import com.example.app.domain.Region;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegionDTO {
    private String name;
    private Integer id;
    public RegionDTO(Region region){
        this.name = region.getRegionName();
        this.id = region.getRegionId();
    }
}