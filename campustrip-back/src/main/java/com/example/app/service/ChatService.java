package com.example.app.service;

import com.example.app.domain.ChatMember;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.app.repository.ChatRepository;
import com.example.app.repository.ChatMemberRepository;
import com.example.app.repository.UserRepository;
import com.example.app.domain.Chat;
import com.example.app.domain.User;
import com.example.app.dto.CreateChat;
import com.example.app.dto.CreateChatMember;

import java.util.List;

@Service
public class ChatService {
    ChatRepository chatRepository;
    ChatMemberRepository chatMemberRepository;
    UserRepository userRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository,
                       ChatMemberRepository chatMemberRepository,
                       UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.chatMemberRepository = chatMemberRepository;
        this.userRepository = userRepository;
    }

    public Chat saveChat(CreateChat createChat) {
        Chat chat = chatRepository.save(createChat.toEntity());
        User user = userRepository.findById(createChat.getUserId()).orElseThrow();
        ChatMember member = new ChatMember(chat, user, true);
        chatMemberRepository.save(member);
        return chat;
    }

    public void saveChatMember(CreateChatMember createChatMember) {
        // DB에서 영속 상태의 엔티티 조회
        Chat chat = chatRepository.findById(createChatMember.getPost().getChat().getId())
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));
        User user = userRepository.findById(createChatMember.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ChatMember chatMember = new ChatMember(chat, user, false);
        chatMemberRepository.save(chatMember);
    }

    public void deleteChatMember(CreateChatMember createChatMember) {
        chatMemberRepository.deleteByChatAndUser(createChatMember.getPost().getChat(),
                                                 createChatMember.getUser());
    }

    public Integer getNumberOfChatMembers(Chat chat) {
        return chatMemberRepository.findAllByChat(chat).size();
    }

    public List<Chat> getMyChatRoom(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<ChatMember> chatMembers = chatMemberRepository.findAllByUser(user);
        return chatMembers.stream()
                          .map(ChatMember::getChat)
                          .toList();
    }
}
