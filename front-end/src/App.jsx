// Import each page so React Router can show the right screen
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

// React Router lets us move between pages without reloading the website
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// This is the list of pages/URLs in the app
const router = createBrowserRouter([
  // Landing/login/signup
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },

  // Main dashboard
  { path: "/dashboard", element: <DashBoard /> },

  // This extra route protects us if old code still uses /DashBoard
  { path: "/DashBoard", element: <DashBoard /> },

  // Group creation/joining
  { path: "/create-group", element: <CreateGroupPage /> },
  { path: "/join-group", element: <JoinGroupPage /> },

  // Main group details page
  { path: "/group/:id", element: <ViewGroupPage /> },

  // These routes are used by buttons inside ViewGroupPage
  { path: "/group/:id/invite", element: <InviteMembersPage /> },
  { path: "/group/:id/approve-members", element: <ApproveMembersPage /> },
  { path: "/group/:id/contribute", element: <MakeContributionPage /> },
  { path: "/group/:id/payouts", element: <PayoutPage /> },
  { path: "/group/:id/settings", element: <GroupSettingsPage /> },
]);

// This loads the router into the app
export default function App() {
  return <RouterProvider router={router} />;
}