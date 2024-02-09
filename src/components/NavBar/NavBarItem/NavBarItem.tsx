import './navBarItem.scss';
import React from "react";

interface NavBarItemProps {
    icon: React.ReactNode;
    isSelected: boolean;
    showDescription: boolean;
    description: string;
    onClick: () => void;
};

function NavBarItem({icon, isSelected, showDescription, description, onClick}: NavBarItemProps) {
    return (
        <>
            <li
                className={`item ${isSelected && 'selected'} ${showDescription && 'navbar-expanded'}`}
                onClick={() => {onClick()}} 
            >
                <span className='icon-container'>
                    {icon}
                    {showDescription && <span className='item-description'>{description}</span>}
                </span>
            </li>
        </>
    )
}

export default NavBarItem;