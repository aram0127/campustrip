import styled from "styled-components";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";

const UserList = styled.div``;

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
  { id: 10, name: "사용자7" },
  { id: 11, name: "사용자11" },
];

function BlockedListPage() {
  return (
    <PageLayout title="차단된 계정">
      <ScrollingContent>
        <UserList>
          {dummyBlockedUsers.map((user) => (
            <UserItem key={user.id}>
              <Avatar />
              <UserInfo>
                <UserName>{user.name}</UserName>
              </UserInfo>
              <UnblockButton>차단됨</UnblockButton>
            </UserItem>
          ))}
        </UserList>
      </ScrollingContent>
    </PageLayout>
  );
}

export default BlockedListPage;
