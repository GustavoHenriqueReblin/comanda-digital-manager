import './navBar.scss';
import NavBarItemComponent from './NavBarItem/NavBarItem';

import React, { useMemo, useState } from "react";
import { LuChefHat } from "react-icons/lu";
import { NavBarItem, NavBarItemsType } from '../../types/types';

interface NavBarProps {
    items: NavBarItem[];
    itemSelected: NavBarItemsType | null;
    setItemSelected: React.Dispatch<React.SetStateAction<NavBarItemsType>>;
    redirect: (typeSelected: NavBarItemsType) => void;
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

function NavBar({ items, itemSelected, setItemSelected, redirect, isExpanded, setIsExpanded }: NavBarProps) {
    const navBarItemsMemoized = useMemo(() => {
        return items.map((item) => (
            <NavBarItemComponent
                key={item.type}
                type={item.type}
                icon={item.icon}
                isSelected={itemSelected === item.type}
                showDescription={isExpanded}
                description={item.description}
                onClick={(typeSelected) => {
                    setItemSelected(item.type);
                    redirect(typeSelected);
                }}
            />
        ));
    }, [isExpanded, itemSelected]);

    return (
        <>
            <div className={`navbar-container ${isExpanded && 'expanded'}`}>
                <div onClick={() => setIsExpanded(!isExpanded)}  className="icon">
                    <LuChefHat />
                </div>
                <ul className='list'>
                    { navBarItemsMemoized }
                </ul>
            </div>
        </>
    )
}

export default NavBar;