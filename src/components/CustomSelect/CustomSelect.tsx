import React, { useState } from "react";
import './customSelect.scss';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

interface CustomSelectProps {
    options: any;
    onClickFilter: (newFilterIndex: string) => void;
};

function CustomSelect({ options, onClickFilter }: CustomSelectProps) {
    const [isVisible, setIsVisible] = useState<Boolean>(false);
    const [descriptionValue, setDescriptionValue] = useState<String>("Concluídos"); 

    const closeSelect = (newValue: string, Id: number) => {
        setDescriptionValue(newValue);
        setIsVisible(false);
        const Index = Id - 1;
        onClickFilter(Index.toString());
    };

    return (
        <>
            <div className="select-container" onClick={() => setIsVisible(!isVisible)}>
                <span className="description">{descriptionValue}</span>
                { isVisible 
                    ? (<IoIosArrowUp />)
                    : (<IoIosArrowDown />)
                }

                { isVisible && 
                    <div className="select-content">
                        {options.map((option: any) => (
                            <div className='select-option' onClick={() => closeSelect(option.description, option.id)} key={option.id}>
                                {option.description} 
                            </div>
                        ))}
                    </div>
                }
            </div>
        </>
    )
}

export default CustomSelect;