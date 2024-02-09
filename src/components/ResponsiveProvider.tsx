import '../global.scss';
import React from "react";

interface ResponsiveProviderProps {
  children: React.ReactNode;
};

function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  return (
    <>
      <div className="page">
        <div className="container">
          { children }
        </div>
      </div>
    </>
  );
}
    
export default ResponsiveProvider;