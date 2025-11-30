import React, { useEffect, useState } from "react";
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

// URL을 File 객체로 변환하는 헬퍼 함수
const urltoFile = async (url: string, filename: string, mimeType: string) => {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    const buf = await res.arrayBuffer();
    return new File([buf], filename, { type: mimeType });
  } catch (e) {
    console.error("이미지 변환 실패:", e);
    return null;
  }
};

const PostEditLoader: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { updateFormData, resetFormData } = usePostCreate();
  const [isConvertingImages, setIsConvertingImages] = useState(true);

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
      const loadData = async () => {
        setIsConvertingImages(true);

        // 텍스트 데이터 주입
        const initialData: any = {
          regions: post.regions,
          title: post.title,
          body: post.body,
          startDate: post.startAt
            ? post.startAt.toString().split("T")[0]
            : null,
          endDate: post.endAt ? post.endAt.toString().split("T")[0] : null,
          teamSize: post.teamSize,
          plannerId: null, // planner 정보가 post에 있다면 여기서 설정
        };

        // 이미지 URL -> File 객체 변환
        if (post.postAssets && post.postAssets.length > 0) {
          try {
            const filePromises = post.postAssets.map((url, index) => {
              const ext = url.split(".").pop() || "jpg";
              const filename = `existing_image_${index}.${ext}`;
              const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;

              return urltoFile(url, filename, mimeType);
            });

            const files = await Promise.all(filePromises);
            initialData.images = files.filter((f): f is File => f !== null);
          } catch (err) {
            console.error("이미지 로드 중 오류 발생:", err);
            initialData.images = [];
          }
        } else {
          initialData.images = [];
        }

        // Context 업데이트
        updateFormData(initialData);
        setIsConvertingImages(false);
      };

      loadData();
    }
  }, [post, updateFormData]); // post가 변경될 때 실행

  // 수정 완료 또는 취소 시 폼 데이터 리셋
  useEffect(() => {
    return () => {
      resetFormData();
    };
  }, [resetFormData]);

  if (isLoading || isConvertingImages) {
    return (
      <PageLayout title="수정 (1/3)">
        <Message>
          {isLoading
            ? "게시글 정보를 불러오는 중..."
            : "이미지를 불러오는 중..."}
        </Message>
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
