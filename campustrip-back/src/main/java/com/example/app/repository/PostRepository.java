package com.example.app.repository;
import com.example.app.domain.Post;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post,Integer>
{
    Post findByPost_id(Integer post_id);
}
