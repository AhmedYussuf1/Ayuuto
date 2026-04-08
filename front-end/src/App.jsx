// these are my pages
import SignUpPage from "./pages/SignUpPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashBoard from "./pages/DashBoard";
import CreateGroupPage from "./pages/CreateGroupPage";
import JoinGroupPage from "./pages/JoinGroupPage";
import ViewGroupPage from "./pages/ViewGroupPage";
import InviteMembersPage from "./pages/InviteMembersPage";
import ApproveMembersPage from "./pages/ApproveMembersPage";
import MakeContributionPage from "./pages/MakeContributionPage";
import PayoutPage from "./pages/PayoutPage";
import GroupSettingsPage from "./pages/GroupSettingsPage";

// this lets me create routes
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// all my routes
const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/dashboard", element: <DashBoard /> },
  { path: "/create-group", element: <CreateGroupPage /> },
  { path: "/join-group", element: <JoinGroupPage /> },
  { path: "/group/:id", element: <ViewGroupPage /> },
  { path: "/group/:id/invite", element: <InviteMembersPage /> },
  { path: "/group/:id/approve-members", element: <ApproveMembersPage /> },
  { path: "/group/:id/contribute", element: <MakeContributionPage /> },
  { path: "/group/:id/payouts", element: <PayoutPage /> },
  { path: "/group/:id/settings", element: <GroupSettingsPage /> },
]);

// loads app
export default function App() {
  return <RouterProvider router={router} />;
}