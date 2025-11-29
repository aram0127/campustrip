package com.example.app.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="Planner")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Planner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="planner_id")
    private Integer plannerId;

    @ManyToOne
    @JoinColumn(name = "membership_id", nullable = false)
    private User user;

    @Column(name="title", nullable=false)
    private String title;

    @Column(name="start_date", nullable=false)
    private java.time.LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private java.time.LocalDate endDate;
}
