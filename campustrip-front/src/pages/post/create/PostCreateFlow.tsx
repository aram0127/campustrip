import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PostCreateRegionPage from "./PostCreateRegionPage";
import PostCreateDetailsPage from "./PostCreateDetailsPage";
import PostCreatePlannerPage from "./PostCreatePlannerPage";
import PostEditLoader from "../edit/PostEditLoader";
import { usePostCreate } from "../../../context/PostCreateContext";

const PostCreateFlow: React.FC = () => {
  const { resetFormData } = usePostCreate();

  useEffect(() => {
    resetFormData();
  }, [resetFormData]);

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
