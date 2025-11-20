package com.example.app.domain;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="Universities")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Universities {
    @Id
    @Column(name="university_id")
    private Integer id;
    @Column(name="university_name", nullable=false, length=100)
    private String name;
    @Column(name="domain", nullable=false, length=100)
    private String domain;
}
