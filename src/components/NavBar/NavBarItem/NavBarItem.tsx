import './navBarItem.scss';
import React from "react";
import { NavBarItemsType } from '../../../types/types';

interface NavBarItemProps {
    type: NavBarItemsType;
    icon: React.ReactNode;
    isSelected: boolean;
    showDescription: boolean;
    description: string;
    onClick: (itemClicked: NavBarItemsType) => void;
};

function NavBarItem({type, icon, isSelected, showDescription, description, onClick}: NavBarItemProps) {
    return (
        <>
            <li
                className={`item ${isSelected && 'selected'} ${showDescription && 'navbar-expanded'}`}
                onClick={() => {onClick(type)}} 
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