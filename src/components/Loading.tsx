import React from "react";
import '../global.scss';

interface LoadingProps {
    title: string;
};

function Loading({ title }: LoadingProps) {
    return (
        <div className="loader-container">
            <span className="loader"></span>
            <span>{ title }</span>
        </div>
    )
}

export default Loading;