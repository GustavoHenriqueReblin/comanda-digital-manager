import React from "react";
import '../global.scss';

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