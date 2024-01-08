import React from "react";
import './bartenderAuthCard.scss';

interface BartenderAuthCardProps {
    bartender: any;
    isVisible: boolean;
    sendResponseAuthReq: (bartender: any, approved: boolean) => void
};

function BartenderAuthCard({ bartender, isVisible, sendResponseAuthReq }: BartenderAuthCardProps) {
    return (
        <>
            { isVisible 
                ? ( <div className="card">
                        <p>{bartender.name}</p>
                        <p>{bartender.securityCode}</p>
                        <div className="buttons-container">
                            <button onClick={() => sendResponseAuthReq(bartender, false)} className="button">Não</button>
                            <button onClick={() => sendResponseAuthReq(bartender, true)} className="button">Sim</button>
                        </div>
                    </div>)
                : (null)
            }
        </>
    );
  }
    
  export default BartenderAuthCard;