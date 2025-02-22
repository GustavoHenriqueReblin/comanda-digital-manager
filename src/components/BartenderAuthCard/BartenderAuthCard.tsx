import './bartenderAuthCard.scss';
import React from "react";
import { Bartender } from '../../types/types';

interface BartenderAuthCardProps {
    bartender: Bartender;
    sendResponseAuthReq: (bartender: Bartender, approved: boolean) => void
};

function BartenderAuthCard({ bartender, sendResponseAuthReq }: BartenderAuthCardProps) {
    return (
        <>
            <div className="card">
                <div className="card-header">
                    <span className="item-card-header">
                        O garçom <span className="bold">{bartender.name}</span> deseja fazer login.
                        <br/>
                        Você deseja aceitar?
                    </span>
                </div>
                <div className="card-buttons-container">
                    <button onClick={() => sendResponseAuthReq(bartender, true)} className="button yes">Sim</button>
                    <button onClick={() => sendResponseAuthReq(bartender, false)} className="button no">Não</button>
                </div>
            </div>
        </>
    );
  }
    
  export default BartenderAuthCard;