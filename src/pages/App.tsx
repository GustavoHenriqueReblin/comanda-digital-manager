import Login from './Login/Login';
import Admin from './Admin/Admin';
import Products from './Admin/Products/Products';
import ResponsiveProvider from "../components/ResponsiveProvider";
import Bartender from './BartenderAuth/BartenderAuth';
import BartenderOrders from './BartenderOrders/BartenderOrders';
import { AdminAuthProvider } from '../contexts/AdminAuthContext';
import { BartenderAuthProvider } from '../contexts/BartenderAuthContext';

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
              <PrivateRoute redirectTo="/login" cookieName={process.env.REACT_APP_COOKIE_AUTH_TOKEN_NAME}> 
                <AdminAuthProvider>
                  <Admin /> 
                </AdminAuthProvider>
              </PrivateRoute>
            } 
          />
          <Route 
            path='/admin/products' element={
              <PrivateRoute redirectTo="/login" cookieName={process.env.REACT_APP_COOKIE_AUTH_TOKEN_NAME}> 
                <AdminAuthProvider>
                  <Products text='Testando' /> 
                </AdminAuthProvider>
              </PrivateRoute>
            } 
          />
          <Route 
            path='/myorders' element={
              <PrivateRoute redirectTo="/" cookieName={process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN}> 
                <BartenderAuthProvider>
                  <BartenderOrders />
                </BartenderAuthProvider>
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