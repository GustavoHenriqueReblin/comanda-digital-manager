import React from "react";
import DataTable from "react-data-table-component";
import './customDataTable.scss';

interface CustomDataTableProps {
    columns: any[];
    data: any[];
    noDataMessage: string;
    customStyles: any;
};

function CustomDataTable({ columns, data, noDataMessage, customStyles }: CustomDataTableProps) {
    return (
        <>
            <DataTable className={`table ${data.length <= 0 && 'noData'}`}
                columns={columns}
                data={data}
                fixedHeader
                // pagination
                highlightOnHover
                pointerOnHover
                noDataComponent={noDataMessage}
                customStyles={customStyles}
            ></DataTable>
        </>
    )
}

export default CustomDataTable;