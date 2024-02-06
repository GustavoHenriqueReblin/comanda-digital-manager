import './customDataTable.scss';
import React from "react";

interface CustomDataTableProps {
    columns: any[];
    data: any[] | undefined;
    noDataMessage: string;
    buttonsOptions: boolean;
    onConfirm: (resData?: any) => void;
    onCancel: (resData?: any) => void;
};

function CustomDataTable({ 
    columns, data, noDataMessage, buttonsOptions, onConfirm, onCancel
}: CustomDataTableProps) {

    const renderRows = (row: any) => {
        return columns.map((column: any) => (
            <td 
                className={`${ buttonsOptions && column.field !== 'null' && 'table-option'}`} 
                key={column.id}
            >
                { column.field !== 'null' 
                    ? ( getDataByFieldName(row, column.field) ) 
                    : ( buttonsOptions && renderButtons(row) ) 
                }
            </td>
        ));
    };
    
    const getDataByFieldName = (obj: any, path: string) => {
        return path.split('.').reduce((acc, key) => 
            (acc && acc[key] !== 'undefined') ? acc[key] : undefined, obj);
    };

    const renderButtons = (rowData: any) => {
        return (
            <>
                <button
                    className={`button confirm ${rowData.status !== 0 && 'disabled'}`}
                    onClick={() => { onConfirm(rowData) }}
                >
                    Confirmar
                </button>
                <button
                    className={`button cancel ${rowData.status !== 0 && 'disabled'}`}
                    onClick={() => { onCancel(rowData) }}
                >
                    Cancelar
                </button>
            </>
        )
    };

    return (
        <>
            { data && data.length > 0 
                ? ( <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                { columns && columns !== null && 
                                    columns.map((column: any) => (
                                        <th key={ column.id }>
                                            { column.name }
                                        </th>
                                    )
                                ) }
                            </tr>
                        </thead>
                        <tbody>
                            { data.map((rowData: any) => (
                                <tr key={rowData.id}>
                                    { renderRows(rowData) }
                                </tr>
                            )) }
                        </tbody>
                    </table>
                </div> ) 
                : ( <span>{ noDataMessage }</span> )
            }
        </>
    )
}

export default CustomDataTable;