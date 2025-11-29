package com.example.app.service;

import com.example.app.domain.ChatMember;
import com.example.app.domain.Post;
import com.example.app.repository.PostRepository;
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
    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository,
                       ChatMemberRepository chatMemberRepository,
                       UserRepository userRepository, PostRepository postRepository) {
        this.chatRepository = chatRepository;
        this.chatMemberRepository = chatMemberRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
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

    public Integer getPostIdByChatId(Integer chatId) {
        Chat chat = chatRepository.findById(chatId).orElseThrow();
        Post post = postRepository.findByChat(chat);
        if (post == null) {
            throw new IllegalArgumentException("Post not found for the given chatId");
        }
        return post.getPostId();
    }

    public void removeChatMemberByPostAndUser(Integer postId, User user) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        Chat chat = post.getChat();
        chatMemberRepository.deleteByChatAndUser(chat, user);
    }
}
