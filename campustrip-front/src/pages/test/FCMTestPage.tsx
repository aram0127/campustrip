import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { requestFcmToken, onMessageListener } from "../../firebase";
import { registerFcmToken, deleteFcmToken, deleteAllUserTokens, sendTestNotification } from "../../api/fcm";
import { useAuth } from "../../context/AuthContext";

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
}

const FCMTestPage: React.FC = () => {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState<string>("");
  const [membershipId, setMembershipId] = useState<string>(user?.id?.toString() || "");
  const [testTitle, setTestTitle] = useState<string>("테스트 알림");
  const [testBody, setTestBody] = useState<string>("이것은 테스트 메시지입니다.");
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // 포그라운드 메시지 수신 리스너
    onMessageListener().then((payload) => {
      console.log("🔔 포그라운드 알림 수신:", payload);
      setNotifications((prev) => [...prev, payload as NotificationPayload]);
      setMessage(`알림 수신: ${(payload as NotificationPayload).notification?.title}`);
    });
  }, []);

  useEffect(() => {
    if (user?.id) {
      setMembershipId(user.id.toString());
    }
  }, [user]);

  const handleRequestToken = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = await requestFcmToken();
      if (token) {
        setFcmToken(token);
        setMessage("✅ FCM 토큰 발급 성공!");
      } else {
        setMessage("❌ 알림 권한이 거부되었거나 토큰 발급에 실패했습니다.");
      }
    } catch (error) {
      console.error("토큰 발급 오류:", error);
      setMessage("❌ 토큰 발급 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterToken = async () => {
    if (!fcmToken) {
      setMessage("❌ 먼저 FCM 토큰을 발급받아주세요.");
      return;
    }
    if (!membershipId) {
      setMessage("❌ Membership ID를 입력해주세요.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await registerFcmToken(Number(membershipId), fcmToken);
      setMessage("✅ 토큰이 서버에 등록되었습니다.");
    } catch (error) {
      console.error("토큰 등록 오류:", error);
      setMessage("❌ 토큰 등록 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteToken = async () => {
    if (!fcmToken) {
      setMessage("❌ 삭제할 토큰이 없습니다.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await deleteFcmToken(fcmToken);
      setMessage("✅ 토큰이 서버에서 삭제되었습니다.");
      setFcmToken("");
    } catch (error) {
      console.error("토큰 삭제 오류:", error);
      setMessage("❌ 토큰 삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllTokens = async () => {
    if (!membershipId) {
      setMessage("❌ Membership ID를 입력해주세요.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await deleteAllUserTokens(Number(membershipId));
      setMessage("✅ 사용자의 모든 토큰이 삭제되었습니다.");
      setFcmToken("");
    } catch (error) {
      console.error("모든 토큰 삭제 오류:", error);
      setMessage("❌ 모든 토큰 삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage("📋 클립보드에 복사되었습니다.");
  };

  const handleSendTestNotification = async () => {
    if (!membershipId) {
      setMessage("❌ Membership ID를 입력해주세요.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await sendTestNotification(
        Number(membershipId),
        testTitle,
        testBody,
        user?.id,
        "TEST"
      );
      setMessage("✅ 테스트 알림이 전송되었습니다.");
    } catch (error) {
      console.error("알림 전송 오류:", error);
      setMessage("❌ 알림 전송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="FCM 알림 테스트" showBackButton>
      <ScrollContainer>
        <Container>
        <Section>
          <SectionTitle>1. FCM 토큰 발급</SectionTitle>
          <Description>
            브라우저에서 알림 권한을 요청하고 FCM 토큰을 발급받습니다.
          </Description>
          <Button onClick={handleRequestToken} disabled={loading} style={{ width: '100%' }}>
            {loading ? "처리 중..." : "FCM 토큰 발급"}
          </Button>
          {fcmToken && (
            <TokenBox>
              <TokenLabel>발급된 토큰:</TokenLabel>
              <TokenValue onClick={() => copyToClipboard(fcmToken)}>
                {fcmToken.substring(0, 50)}...
              </TokenValue>
              <CopyButton onClick={() => copyToClipboard(fcmToken)}>
                복사
              </CopyButton>
            </TokenBox>
          )}
        </Section>

        <Section>
          <SectionTitle>2. 토큰 서버에 등록</SectionTitle>
          <Description>
            발급받은 토큰을 백엔드 서버에 등록합니다.
          </Description>
          <InputWrapper>
            <InputLabel>Membership ID</InputLabel>
            <Input
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              placeholder="사용자 ID 입력"
              type="number"
            />
          </InputWrapper>
          <ButtonGroup>
            <Button onClick={handleRegisterToken} disabled={loading || !fcmToken}>
              서버에 등록
            </Button>
            <Button
              onClick={handleDeleteToken}
              disabled={loading || !fcmToken}
              style={{ backgroundColor: "#ff6b6b" }}
            >
              토큰 삭제
            </Button>
            <Button
              onClick={handleDeleteAllTokens}
              disabled={loading || !membershipId}
              style={{ backgroundColor: "#ff4757" }}
            >
              모든 토큰 삭제
            </Button>
          </ButtonGroup>
        </Section>

        <Section>
          <SectionTitle>3. 테스트 알림 정보</SectionTitle>
          <Description>
            백엔드에서 알림을 보낼 때 사용할 정보입니다.
          </Description>
          <InputWrapper>
            <InputLabel>알림 제목</InputLabel>
            <Input
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              placeholder="알림 제목"
            />
          </InputWrapper>
          <InputWrapper>
            <InputLabel>알림 내용</InputLabel>
            <Input
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              placeholder="알림 내용"
            />
          </InputWrapper>
          <InfoBox>
            <InfoTitle>백엔드 테스트 방법:</InfoTitle>
            <CodeBlock>
              {`// Java 코드 예시
fcmService.sendNotificationToUser(
    ${membershipId || "membershipId"}, 
    "${testTitle}", 
    "${testBody}"
);`}
            </CodeBlock>
          </InfoBox>
          <Button
            onClick={handleSendTestNotification}
            disabled={loading || !membershipId}
            style={{ width: '100%', marginTop: '16px', backgroundColor: '#28a745' }}
          >
            {loading ? "전송 중..." : "테스트 알림 전송"}
          </Button>
        </Section>

        <Section>
          <SectionTitle>4. 수신된 알림</SectionTitle>
          <Description>
            포그라운드에서 수신된 알림 목록입니다.
          </Description>
          {notifications.length === 0 ? (
            <EmptyMessage>아직 수신된 알림이 없습니다.</EmptyMessage>
          ) : (
            <NotificationList>
              {notifications.map((notif, index) => (
                <NotificationItem key={index}>
                  <NotificationTitle>
                    {notif.notification?.title || "제목 없음"}
                  </NotificationTitle>
                  <NotificationBody>
                    {notif.notification?.body || "내용 없음"}
                  </NotificationBody>
                  <NotificationTime>
                    {new Date().toLocaleTimeString()}
                  </NotificationTime>
                </NotificationItem>
              ))}
            </NotificationList>
          )}
        </Section>

        {message && (
          <MessageBox success={message.includes("✅")}>
            {message}
          </MessageBox>
        )}

        <Section>
          <SectionTitle>📝 사용 가이드</SectionTitle>
          <GuideList>
            <GuideItem>1. "FCM 토큰 발급" 버튼을 클릭하여 알림 권한을 허용하고 토큰을 발급받습니다.</GuideItem>
            <GuideItem>2. Membership ID를 입력하고 "서버에 등록" 버튼을 클릭합니다.</GuideItem>
            <GuideItem>3. 백엔드에서 위의 Java 코드를 사용하여 알림을 전송합니다.</GuideItem>
            <GuideItem>4. 앱이 포그라운드에 있으면 아래 "수신된 알림" 섹션에 표시됩니다.</GuideItem>
            <GuideItem>5. 백그라운드에서는 브라우저 자체 알림으로 표시됩니다.</GuideItem>
          </GuideList>
        </Section>
      </Container>
      </ScrollContainer>
    </PageLayout>
  );
};

export default FCMTestPage;

const ScrollContainer = styled.div`
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderColor};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.secondaryTextColor};
  }
`;

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 40px;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 16px;
  line-height: 1.5;
`;

const InputWrapper = styled.div`
  margin-bottom: 16px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const TokenBox = styled.div`
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const TokenLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 8px;
`;

const TokenValue = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-all;
  cursor: pointer;
  padding: 8px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  margin-bottom: 8px;

  &:hover {
    background: ${({ theme }) => theme.colors.borderColor};
  }
`;

const CopyButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  & > button {
    flex: 1;
  }
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  padding: 16px;
  margin-top: 16px;
`;

const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const CodeBlock = styled.pre`
  font-family: monospace;
  font-size: 12px;
  color: #2c3e50;
  background: white;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificationItem = styled.div`
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  padding: 16px;
`;

const NotificationTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const NotificationBody = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 8px;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  font-size: 14px;
`;

const MessageBox = styled.div<{ success: boolean }>`
  background: ${({ success }) => (success ? "#d4edda" : "#f8d7da")};
  color: ${({ success }) => (success ? "#155724" : "#721c24")};
  border: 1px solid ${({ success }) => (success ? "#c3e6cb" : "#f5c6cb")};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const GuideList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const GuideItem = styled.li`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 0;
  line-height: 1.6;

  &:before {
    content: "▪";
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1em;
  }

  padding-left: 1em;
`;

