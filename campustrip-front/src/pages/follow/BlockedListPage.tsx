import React from 'react';
import styled from 'styled-components';
import { IoArrowBack } from 'react-icons/io5';

const PageContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const UserList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex-grow: 1;
  overflow: hidden;
`;

const UserName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const UnblockButton = styled.button`
  background-color: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.text};
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    opacity: 0.9;
  }
`;

// --- 임시 데이터 ---
const dummyBlockedUsers = [
  { id: 10, name: '사용자7'},
  { id: 11, name: '사용자11'},
];

function BlockedListPage() {
  return (
    <PageContainer>
      <Header>
        <BackButton><IoArrowBack /></BackButton>
        <Title>차단된 계정</Title>
      </Header>
      <UserList>
        {dummyBlockedUsers.map(user => (
          <UserItem key={user.id}>
            <Avatar />
            <UserInfo>
              <UserName>{user.name}</UserName>
            </UserInfo>
            <UnblockButton>차단됨</UnblockButton>
          </UserItem>
        ))}
      </UserList>
    </PageContainer>
  );
}

export default BlockedListPage;