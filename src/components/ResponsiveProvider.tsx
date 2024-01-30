import '../global.scss';
import React from "react";

function ResponsiveProvider({ children }: any) {
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