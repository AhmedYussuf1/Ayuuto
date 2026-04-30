import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashBoard from "./pages/DashBoard";
import CreateGroupPage from "./pages/CreateGroupPage";
import JoinGroupPage from "./pages/JoinGroupPage";
import ViewGroupPage from "./pages/ViewGroupPage";
import InviteMembersPage from "./pages/InviteMembersPage";
import MakeContributionPage from "./pages/MakeContributionPage";
import ContributionsPage from "./pages/ContributionsPage";
import PayoutPage from "./pages/PayoutPage";
import GroupSettingsPage from "./pages/GroupSettingsPage";
import ApproveMembersPage from "./pages/ApproveMembersPage";

/*
  App.jsx

  This file controls all frontend routes.

  New routes added:
  /group/:id/contributions
    - lets users view all contributions for a group

  /group/:id/manage-members
    - lets admin manage member roles and active status

  Note:
  The file is still named ApproveMembersPage, but the page title says
  Manage Members because the backend does not support true approval status.
*/

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/dashboard", element: <DashBoard /> },
  { path: "/create-group", element: <CreateGroupPage /> },
  { path: "/join-group", element: <JoinGroupPage /> },

  { path: "/group/:id", element: <ViewGroupPage /> },
  { path: "/group/:id/invite", element: <InviteMembersPage /> },
  { path: "/group/:id/contribution", element: <MakeContributionPage /> },
  { path: "/group/:id/contributions", element: <ContributionsPage /> },
  { path: "/group/:id/payouts", element: <PayoutPage /> },
  { path: "/group/:id/settings", element: <GroupSettingsPage /> },
  { path: "/group/:id/manage-members", element: <ApproveMembersPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}