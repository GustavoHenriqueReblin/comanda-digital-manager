import Cookies from 'js-cookie';
import Login from './Login/Login';
import Admin from './Admin/Admin';
import Bartender from './BartenderAuth/BartenderAuth';
import ResponsiveProvider from "../components/ResponsiveProvider";
import Header from "../components/Header/Header";

import React from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, redirectTo }) => {
  const cookieName = process.env.REACT_APP_COOKIE_NAME_USER_TOKEN;
  const isAuthenticated = !!(Cookies.get(cookieName ? cookieName : ''));
  return isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} />;
}

function App() {
  return (
    <BrowserRouter>
      <ResponsiveProvider>
        <Header />
        <Routes>
          <Route 
            path='/admin' element={
              <PrivateRoute redirectTo="/login">
                <Admin />
              </PrivateRoute>
            } 
          />
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Bartender />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ResponsiveProvider>
    </BrowserRouter>
  );
}

export default App;
