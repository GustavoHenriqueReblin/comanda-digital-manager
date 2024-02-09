import './navBar.scss';
import NavBarItemComponent from './NavBarItem/NavBarItem';

import React, { useMemo, useState } from "react";
import { LuChefHat } from "react-icons/lu";
import { NavBarItem, NavBarItemsType } from '../../types/types';

interface NavBarProps {
    items: NavBarItem[];
};

function NavBar({items}: NavBarProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [itemSelected, setItemSelected] = useState<NavBarItemsType>(items[0].type);

    const navBarItemsMemoized = useMemo(() => {
        return items.map((item) => (
            <NavBarItemComponent
                key={item.type}
                icon={item.icon}
                isSelected={itemSelected === item.type}
                showDescription={isExpanded}
                description={item.description}
                onClick={() => {setItemSelected(item.type)}}
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