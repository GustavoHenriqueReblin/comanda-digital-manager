import React, { useEffect } from "react";
import './modal.scss';
import { IoClose } from "react-icons/io5";

interface ModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

function Modal({ title, isOpen, onClose, onConfirm }: ModalProps) {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            const keyCode = event.keyCode || event.which;
            if (keyCode === 27) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    return (
        <>  
            { isOpen && (
                <div className="modal-container">
                    <div className="modal">
                        <div className="close-container">
                            <div onClick={() => onClose()} className="close-button">
                                <IoClose />
                            </div>
                        </div>
                        <div className="title-container">
                            <h2 className="title"> { title } </h2>
                        </div>
                        <div className="choices">
                            <button onClick={() => onConfirm()} className="button yes">Sim</button>
                            <button onClick={() => onClose()} className="button no">Não</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Modal;