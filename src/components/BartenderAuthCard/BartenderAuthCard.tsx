import React from "react";
import './bartenderAuthCard.scss';

interface BartenderAuthCardProps {
    bartender: any;
    sendResponseAuthReq: (bartender: any, approved: boolean) => void
};

function BartenderAuthCard({ bartender, sendResponseAuthReq }: BartenderAuthCardProps) {
    return (
        <>
            <div className="card">
                <p>{bartender.name}</p>
                <p>{bartender.securityCode}</p>
                <div className="buttons-container">
                    <button onClick={() => sendResponseAuthReq(bartender, false)} className="button">Não</button>
                    <button onClick={() => sendResponseAuthReq(bartender, true)} className="button">Sim</button>
                </div>
            </div>
        </>
    );
  }
    
  export default BartenderAuthCard;