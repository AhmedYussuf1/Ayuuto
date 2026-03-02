 
import SignUpPage from "./pages/SignUpPage";

import LandingPage from "./pages/LandingPage";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashBoard from "./DashBoard";
import LoginPage from "./pages/LoginPage";



const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/DashBoard", element: <DashBoard /> }
]);

export default function App(){
  return <RouterProvider router={router} />;

}