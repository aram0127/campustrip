package com.example.app.repository;

import com.example.app.domain.Chat;
import com.example.app.domain.ChatMember;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMemberRepository  extends JpaRepository<ChatMember, ChatMember.ChatMemberId> {
    List<ChatMember> findAllByUser(User user);
    List<ChatMember> findAllByChat(Chat chat);
    ChatMember findByChatAndUser(Chat chat, User user);
    void deleteByChatAndUser(Chat chat, User user);
}
