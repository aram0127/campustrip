import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PostCreateRegionPage from "./PostCreateRegionPage";
import PostCreateDetailsPage from "./PostCreateDetailsPage";
import PostCreatePlannerPage from "./PostCreatePlannerPage";
import PostEditLoader from "../edit/PostEditLoader";
import { usePostCreate } from "../../../context/PostCreateContext";

const PostCreateFlow: React.FC = () => {
  const { resetFormData } = usePostCreate();
  const location = useLocation();

  useEffect(() => {
    // 수정 모드가 아닐 때만 폼 데이터 초기화
    if (!location.pathname.includes("/edit")) {
      resetFormData();
    }
  }, []);

  return (
    <Routes>
      <Route path="region" element={<PostCreateRegionPage />} />
      <Route path="details" element={<PostCreateDetailsPage />} />
      <Route path="planner" element={<PostCreatePlannerPage />} />
      <Route path="/posts/edit/:postId/*" element={<PostEditLoader />} />

      <Route path="*" element={<Navigate to="region" replace />} />
    </Routes>
  );
};

export default PostCreateFlow;
