package com.example.app.repository;


import com.example.app.domain.PostRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRegionRepository extends JpaRepository<PostRegion, PostRegion.PostRegionId> {

}
