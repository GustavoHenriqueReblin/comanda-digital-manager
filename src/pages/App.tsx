import Login from './Login/Login';
import Admin from './Admin/Admin';
import Products from './Admin/Products/Products';
import ResponsiveProvider from "../components/ResponsiveProvider";
import Bartender from './BartenderAuth/BartenderAuth';
import BartenderQueue from './BartenderQueue/BartenderQueue';
import { NavBarItem, NavBarItemsType } from '../types/types';
import { AdminContext } from '../contexts/AdminContext';

import React, { useState } from "react";
import Cookies from 'js-cookie';
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { MdFastfood } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo: string;
  cookieName: string | undefined;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, redirectTo, cookieName }) => {
  const isAuthenticated = !!(Cookies.get(cookieName ? cookieName : ''));
  return isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} />;
}

const adminNavBarItems: NavBarItem[] = [
  { type: NavBarItemsType.HOME, description: 'Home', icon: <GoHomeFill /> },
  { type: NavBarItemsType.PRODUCTS, description: 'Produtos', icon: <MdFastfood /> },
  //{ type: NavBarItemsType.BARTENDERS, description: 'Garçons', icon: <FaUserAlt /> },
];

function App() {
  const [adminItemNavBarSelected, setAdminItemNavBarSelected] = useState<NavBarItemsType>(adminNavBarItems[0].type);
  const [isAdminNavBarExpanded, setIsAdminNavBarExpanded] = useState<boolean>(false);

  return (
    <BrowserRouter>
      <ResponsiveProvider>
        <Routes>
          <Route 
            path='/admin' element={
              <PrivateRoute redirectTo="/login" cookieName={process.env.REACT_APP_COOKIE_NAME_USER_TOKEN}> 
                <AdminContext.Provider value={{
                  adminNavBarItems, adminItemNavBarSelected, setAdminItemNavBarSelected, 
                  isAdminNavBarExpanded, setIsAdminNavBarExpanded
                }}>
                  <Admin /> 
                </AdminContext.Provider>
              </PrivateRoute>
            } 
          />
          <Route 
            path='/admin/products' element={
              <PrivateRoute redirectTo="/login" cookieName={process.env.REACT_APP_COOKIE_NAME_USER_TOKEN}> 
                <AdminContext.Provider value={{
                  adminNavBarItems, adminItemNavBarSelected, setAdminItemNavBarSelected, 
                  isAdminNavBarExpanded, setIsAdminNavBarExpanded
                }}>
                  <Products text='Testando' /> 
                </AdminContext.Provider>
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