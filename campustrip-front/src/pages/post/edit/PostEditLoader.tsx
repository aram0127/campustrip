import React, { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../../../api/posts";
import { usePostCreate } from "../../../context/PostCreateContext";
import PostCreateFlow from "../create/PostCreateFlow";
import PageLayout from "../../../components/layout/PageLayout";
import styled from "styled-components";

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const PostEditLoader: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { updateFormData, resetFormData } = usePostCreate();

  // postId로 기존 게시글 데이터 조회
  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["postForEdit", postId],
    queryFn: () => getPostById(postId!),
    enabled: !!postId,
  });

  // 조회가 완료되면 Context에 데이터 주입
  useEffect(() => {
    if (post) {
      updateFormData({
        regions: post.regions,
        title: post.title,
        body: post.body,
        startDate: post.startAt ? post.startAt.split("T")[0] : null,
        endDate: post.endAt ? post.endAt.split("T")[0] : null,
        teamSize: post.teamSize,
      });
    }
  }, [post, updateFormData]);

  // 수정 완료 또는 취소 시 폼 데이터 리셋
  useEffect(() => {
    return () => {
      resetFormData();
    };
  }, [resetFormData]);

  if (isLoading) {
    return (
      <PageLayout title="수정 (1/3)">
        <Message>수정할 게시글 정보를 불러오는 중...</Message>
      </PageLayout>
    );
  }

  if (error || !post) {
    alert("게시글을 불러오는 데 실패했습니다.");
    return <Navigate to="/posts" replace />;
  }

  return <PostCreateFlow />;
};

export default PostEditLoader;
