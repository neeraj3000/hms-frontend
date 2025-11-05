"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import DashboardOverview from "./DashboardOverview";
import RecentPrescriptions from "./RecentPrescriptions";
import Profile from "./Profile";

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("prescriptions");
  const { data: session, status } = useSession();

  // Handle loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading your dashboard...
      </div>
    );
  }

  // Handle case where session is not available (not logged in)
  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Unauthorized access. Please log in.
      </div>
    );
  }

  const studentId = session.user?.id;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "prescriptions":
        return <RecentPrescriptions student_id={studentId!} />;
      case "profile":
        return <Profile />;
      default:
        return <RecentPrescriptions student_id={studentId!} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-16 px-4">{renderContent()}</div>
    </div>
  );
};

export default StudentDashboard;
