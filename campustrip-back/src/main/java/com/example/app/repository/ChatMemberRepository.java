package com.example.app.repository;

import com.example.app.domain.Chat;
import com.example.app.domain.ChatMember;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMemberRepository  extends JpaRepository<ChatMember, ChatMember.ChatMemberId> {
    List<ChatMember> findAllByUser(User user);
    List<ChatMember> findAllByChat(Chat chat);
    ChatMember findByChatAndUser(Chat chat, User user);
    void deleteByChatAndUser(Chat chat, User user);
    // chatId 리스트로 ChatMember 찾기 (role이 true인 멤버만)
    @Query("SELECT cm FROM ChatMember cm LEFT JOIN FETCH cm.user WHERE cm.chat.id IN :chatIds ORDER BY cm.chat.id ASC")
    List<ChatMember> findAllByChatIdIn(List<Integer> chatIds);

}
