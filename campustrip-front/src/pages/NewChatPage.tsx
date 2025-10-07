import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoSearch } from 'react-icons/io5';

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
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
  margin-right: 16px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const CreateButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-left: auto;

  &:disabled {
    color: ${({ theme }) => theme.colors.grey};
    cursor: not-allowed;
  }
`;

const SearchContainer = styled.div`
  padding: 16px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  box-sizing: border-box;
`;

const SearchIcon = styled(IoSearch)`
  position: absolute;
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.grey};
`;

const UserList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const UserItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
`;

const UserName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-left: auto;
  width: 20px;
  height: 20px;
`;

// --- 임시 데이터 ---
const dummyUsers = [
  { id: 1, name: '홍길동' },
  { id: 2, name: '안기준' },
  { id: 3, name: '김철수' },
  { id: 4, name: '아람' },
  { id: 5, name: '사용자' },
];

function NewChatPage() {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const navigate = useNavigate();

  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) return;
    // 실제로는 여기서 선택된 사용자들과 새 채팅방을 만드는 API를 호출
    alert(`${selectedUsers.length}명의 사용자와 채팅방을 생성합니다.`);
    navigate('/chat'); // 채팅 목록으로 이동
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}><IoArrowBack /></BackButton>
        <Title>새로운 채팅</Title>
        <CreateButton onClick={handleCreateChat} disabled={selectedUsers.length === 0}>
          생성
        </CreateButton>
      </Header>
      <SearchContainer>
        <SearchIcon />
        <SearchInput placeholder="사용자 검색" />
      </SearchContainer>
      <UserList>
        {dummyUsers.map(user => (
          <UserItem key={user.id}>
            <Avatar />
            <UserName>{user.name}</UserName>
            <Checkbox onChange={() => handleUserSelect(user.id)} />
          </UserItem>
        ))}
      </UserList>
    </PageContainer>
  );
}

export default NewChatPage;