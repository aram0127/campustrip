import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.borderColor};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Logo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
  line-height: 1.4;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 32px;
  line-height: 1.5;
`;

const InstructionBox = styled.div`
  width: 100%;
  margin-bottom: 24px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.borderColor};
  border-radius: 12px;
`;

const IOSInstruction = styled.div`
  text-align: left;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`;

const Step = styled.p`
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const ShareIcon = styled.span`
  font-size: 18px;
`;

const SkipButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  text-decoration: underline;
  cursor: pointer;
  padding: 10px;
`;

interface InstallGuidePageProps {
  onClose: () => void;
  deferredPrompt: any;
}

const InstallGuidePage: React.FC<InstallGuidePageProps> = ({
  onClose,
  deferredPrompt,
}) => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // iOS 기기 판별
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIosDevice);
  }, []);

  const handleInstallClick = () => {
    if (!isIOS && deferredPrompt) {
      // Android/Chrome 등: 설치 프롬프트 실행
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
          onClose(); // 설치 수락 시 가이드 닫기
        }
      });
    } else if (!isIOS && !deferredPrompt) {
      alert("브라우저 메뉴의 '앱 설치' 또는 '홈 화면에 추가'를 이용해주세요.");
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <Logo src="/icon-192x192.png" alt="App Logo" />
        <Title>
          앱을 설치하고
          <br />더 편하게 여행하세요!
        </Title>
        <Description>
          Campus Trip 앱을 설치하면 알림 수신 등<br />더 나은 경험을 할 수
          있습니다.
        </Description>

        <InstructionBox>
          {isIOS ? (
            <IOSInstruction>
              <Step>
                1. 하단의 <strong>공유 버튼</strong> <ShareIcon>📤</ShareIcon>{" "}
                을 누르세요.
              </Step>
              <Step>
                2. <strong>'홈 화면에 추가'</strong>를 선택하세요.
              </Step>
              <Step>
                3. 상단의 <strong>'추가'</strong>를 누르면 완료!
              </Step>
            </IOSInstruction>
          ) : (
            <Button $size="large" onClick={handleInstallClick}>
              앱 설치하기
            </Button>
          )}
        </InstructionBox>

        <SkipButton onClick={onClose}>모바일 웹으로 계속하기</SkipButton>
      </ContentWrapper>
    </Container>
  );
};

export default InstallGuidePage;
