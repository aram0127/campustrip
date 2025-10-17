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

    public void saveChat(CreateChat createChat) {
        Chat chat = chatRepository.save(createChat.toEntity());
        User user = userRepository.findById(createChat.getUserId()).orElseThrow();
        ChatMember member = new ChatMember(chat, user, true);
        chatMemberRepository.save(member);
    }

    public void saveChatMember(CreateChatMember createChatMember) {
        ChatMember chatMember = new ChatMember(createChatMember.getPost().getChat(),
                                               createChatMember.getUser(), false);
        chatMemberRepository.save(chatMember);
    }

    public void deleteChatMember(CreateChatMember createChatMember) {
        chatMemberRepository.deleteByChatAndUser(createChatMember.getPost().getChat(),
                                                 createChatMember.getUser());
    }

    public Integer getNumberOfChatMembers(Chat chat) {
        return chatMemberRepository.findAllByChat(chat).size();
    }
}
