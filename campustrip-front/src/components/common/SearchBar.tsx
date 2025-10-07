import React from 'react';
import styled from 'styled-components';
import { AiOutlineSearch } from 'react-icons/ai';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  padding-left: 40px;
  border: 1px solid ${({ theme }) => theme.colors.grey};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  box-sizing: border-box;
`;

const SearchIcon = styled(AiOutlineSearch)`
  position: absolute;
  left: 12px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.grey};
  font-size: 20px;
`;

interface SearchBarProps {
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "검색...", onChange }) => {
  return (
    <SearchContainer>
      <SearchIcon />
      <SearchInput placeholder={placeholder} onChange={onChange} />
    </SearchContainer>
  );
};

export default SearchBar;