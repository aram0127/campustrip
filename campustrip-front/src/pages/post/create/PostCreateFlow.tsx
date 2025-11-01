import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PostCreateProvider } from "../../../context/PostCreateContext";
import PostCreateRegionPage from "./PostCreateRegionPage";
import PostCreateDetailsPage from "./PostCreateDetailsPage";
import PostCreatePlannerPage from "./PostCreatePlannerPage";

const PostCreateFlow: React.FC = () => {
  return (
    <PostCreateProvider>
      <Routes>
        <Route path="region" element={<PostCreateRegionPage />} />
        <Route path="details" element={<PostCreateDetailsPage />} />
        <Route path="planner" element={<PostCreatePlannerPage />} />

        <Route path="*" element={<Navigate to="region" replace />} />
      </Routes>
    </PostCreateProvider>
  );
};

export default PostCreateFlow;
