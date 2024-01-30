import './customDataTable.scss';
import React from "react";
import DataTable from "react-data-table-component";

interface CustomDataTableProps {
    columns: any[];
    data: any[];
    noDataMessage: string;
    customStyles: any;
    defaultSortFieldId: number;
    defaultSortAsc: boolean;
};

function CustomDataTable({ 
    columns, data, noDataMessage, customStyles, defaultSortFieldId, defaultSortAsc
}: CustomDataTableProps) {
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
                defaultSortFieldId={defaultSortFieldId}
                defaultSortAsc={defaultSortAsc}
            ></DataTable>
        </>
    )
}

export default CustomDataTable;