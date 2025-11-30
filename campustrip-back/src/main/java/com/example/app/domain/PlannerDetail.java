package com.example.app.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PlannerDetail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlannerDetail {
    @EmbeddedId
    private PlannerDetailId id;

    @MapsId("plannerId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "planner_id", nullable = false)
    private Planner planner;

    @Column(name = "day", nullable = false)
    private Integer day;

    @Column(name = "google_place_id", nullable = false)
    private String googlePlaceId;
}