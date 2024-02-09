import Login from './Login/Login';
import Admin from './Admin/Admin';
import Bartender from './BartenderAuth/BartenderAuth';
import BartenderQueue from './BartenderQueue/BartenderQueue';
import ResponsiveProvider from "../components/ResponsiveProvider";
import Header from "../components/Header/Header";

import React from "react";
import Cookies from 'js-cookie';
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo: string;
  cookieName: string | undefined;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, redirectTo, cookieName }) => {
  const isAuthenticated = !!(Cookies.get(cookieName ? cookieName : ''));
  return isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} />;
}

function App() {
  return (
    <BrowserRouter>
      <ResponsiveProvider>
        <Routes>
          <Route 
            path='/admin' element={
              <PrivateRoute redirectTo="/login" cookieName={process.env.REACT_APP_COOKIE_NAME_USER_TOKEN}> 
                <Admin />
              </PrivateRoute>
            } 
          />
          <Route 
            path='/queue' element={
              <PrivateRoute redirectTo="/" cookieName={process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN}> 
                <BartenderQueue />
              </PrivateRoute>
            } 
          />
          <Route path='/login' element={<Login />} />
          <Route path='/queue' element={<BartenderQueue />} />
          <Route path='/' element={<Bartender />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ResponsiveProvider>
    </BrowserRouter>
  );
}

export default App;