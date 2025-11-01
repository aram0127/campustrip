package com.example.app.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PlannerDetailId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "planner_order")
    private Integer plannerOrder;

    @Column(name = "planner_id")
    private Integer plannerId;
}
