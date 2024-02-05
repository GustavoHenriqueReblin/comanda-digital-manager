import './customSelect.scss';
import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

interface CustomSelectProps {
    options: any;
    onClickFilter: (newFilterIndex: string) => void;
};

function CustomSelect({ options, onClickFilter }: CustomSelectProps) {
    const [isVisible, setIsVisible] = useState<Boolean>(false);
    const [descriptionValue, setDescriptionValue] = useState<String>("Concluídos"); 
    const selectRef = useRef<HTMLDivElement>(null);

    const closeSelect = (newValue: string, id: number) => {
        setDescriptionValue(newValue);
        setIsVisible(false);
        const Index = id - 1;
        onClickFilter(Index.toString());
    };

    useEffect(() => {
        const handleClick = (e: any) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsVisible(false);
            }
        };

        document.addEventListener("click", handleClick);
        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <>
            <div ref={selectRef} className="select-container" onClick={() => setIsVisible(!isVisible)}>
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