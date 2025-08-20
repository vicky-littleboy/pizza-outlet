"use client";

import { Suspense } from "react";
import ProfileContent from "./ProfileContent";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
} 