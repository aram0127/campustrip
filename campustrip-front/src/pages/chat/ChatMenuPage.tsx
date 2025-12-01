import React, { useMemo } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoLogOutOutline } from "react-icons/io5";
import { getChatMembers } from "../../api/chats";
import { leaveChat } from "../../api/applications";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";

const Container = styled(ScrollingContent)`
  background-color: ${({ theme }) => theme.colors.background};
`;

const InfoSection = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  text-align: center;
`;

const ChatTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const MemberCount = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin: 0;
`;

const MemberListHeader = styled.div`
  padding: 20px 20px 10px 20px;
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const MemberList = styled.div`
  padding: 0 20px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};

  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
  background-image: url(${({ $imageUrl }) =>
    $imageUrl || "/default-profile.png"});
  background-size: cover;
  background-position: center;
`;

const MemberName = styled.span<{ $isMe: boolean }>`
  font-size: 16px;
  font-weight: ${({ $isMe }) => ($isMe ? "bold" : "500")};
  color: ${({ theme }) => theme.colors.text};
  flex-grow: 1;
`;

const MeBadge = styled.span`
  font-size: 12px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
`;

const Footer = styled.div`
  padding: 20px;
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const LeaveButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ChatMenuPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 멤버 목록 조회
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["chatMembers", chatId],
    queryFn: () => getChatMembers(chatId!),
    enabled: !!chatId,
  });

  // 채팅방 나가기 Mutation
  const leaveMutation = useMutation({
    mutationFn: leaveChat,
    onSuccess: () => {
      // 채팅 목록 쿼리 무효화하여 갱신
      queryClient.invalidateQueries({ queryKey: ["myChats"] });
      navigate("/chat", { replace: true });
    },
    onError: (err) => {
      console.error(err);
      alert("나가기 처리에 실패했습니다.");
    },
  });

  const handleLeaveChat = () => {
    if (window.confirm("정말로 나가시겠습니까?")) {
      leaveMutation.mutate(Number(chatId));
    }
  };

  // 채팅방 제목 추출
  const chatTitle = useMemo(() => {
    if (members.length > 0 && members[0].chatTitle) {
      return members[0].chatTitle;
    }
    return "채팅방 정보";
  }, [members]);

  if (isLoading) {
    return (
      <PageLayout title="메뉴">
        <div style={{ padding: 20, textAlign: "center" }}>로딩 중...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="채팅 메뉴"
      showBackButton={true}
      onBackClick={() => navigate(-1)}
    >
      <Container>
        <InfoSection>
          <ChatTitle>{chatTitle}</ChatTitle>
          <MemberCount>참여 인원 {members.length}명</MemberCount>
        </InfoSection>

        <MemberListHeader>대화 상대</MemberListHeader>
        <MemberList>
          {members.map((member) => {
            const isMe = member.userId === user?.id;
            return (
              <MemberItem key={member.userId}>
                <Avatar $imageUrl={member.profilePhotoUrl} />
                <MemberName $isMe={isMe}>
                  {member.userName}
                  {isMe && <MeBadge>나</MeBadge>}
                </MemberName>
              </MemberItem>
            );
          })}
        </MemberList>
      </Container>

      <Footer>
        <Button
          $variant="danger"
          $size="large"
          style={{ width: "100%" }}
          onClick={handleLeaveChat}
          disabled={leaveMutation.isPending}
        >
          <LeaveButtonContent>
            <IoLogOutOutline size={20} />
            {leaveMutation.isPending ? "처리 중..." : "채팅방 나가기"}
          </LeaveButtonContent>
        </Button>
      </Footer>
    </PageLayout>
  );
};

export default ChatMenuPage;
