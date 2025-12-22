import Navbar from "@/components/navbar";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default AuthLayout;
