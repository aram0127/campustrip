package com.example.app.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name="Region")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Region {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="region_id")
    private Integer regionId;

    @Column(name="region_name", nullable=false, length=50)
    private String regionName;

    @ManyToMany(mappedBy = "regions")
    private List<Post> posts = new ArrayList<>();
    // 기본 생성자, getter, setter 생략
}
