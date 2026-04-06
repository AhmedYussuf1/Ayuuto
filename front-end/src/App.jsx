// these are my pages
import SignUpPage from "./pages/SignUpPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashBoard from "./pages/DashBoard";
import CreateGroupPage from "./pages/CreateGroupPage";
import JoinGroupPage from "./pages/JoinGroupPage";
import ViewGroupPage from "./pages/ViewGroupPage";

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
]);

// loads app
export default function App() {
  return <RouterProvider router={router} />;
}