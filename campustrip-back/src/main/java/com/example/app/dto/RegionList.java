package com.example.app.dto;

import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegionList {
    private String province;
    private List<RegionDTO> regions;
}