import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';
import * as React from 'react';

interface DataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData, any>[];
    pageSize?: number;
    searchPlaceholder?: string;
    showAdvancedSearch?: boolean;
    onNameSearch?: (rowText: string, nameQuery: string) => boolean;
}

export function DataTable<TData>({ 
    data, 
    columns, 
    pageSize = 20,
    searchPlaceholder = "Search across all fields...",
    showAdvancedSearch = false,
    onNameSearch
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [nameSearch, setNameSearch] = useState('');

    // Filter data based on name search
    const filteredData = React.useMemo(() => {
        if (!nameSearch.trim()) {
            return data;
        }
        
        if (!onNameSearch) {
            return data;
        }
        
        const lowerQuery = nameSearch.toLowerCase();
        
        return data.filter((row: any) => {
            // Check all string fields in the row
            const rowText = Object.values(row)
                .filter(val => typeof val === 'string')
                .join(' ')
                .toLowerCase();
            
            // Use the onNameSearch callback to check if this row matches the person search
            return onNameSearch(rowText, lowerQuery);
        });
    }, [data, nameSearch, onNameSearch]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: (row, columnId, filterValue) => {
            const searchValue = String(filterValue).toLowerCase();
            const rowValues = String(row.getValue(columnId)).toLowerCase();
            
            // First check if the search value directly matches the row
            if (rowValues.includes(searchValue)) {
                return true;
            }
            
            // If onNameSearch is provided, also check person names
            if (onNameSearch) {
                const allRowText = Object.values(row.original)
                    .filter(val => typeof val === 'string')
                    .join(' ')
                    .toLowerCase();
                
                // Check if this search matches a person and that person is in the row
                return onNameSearch(allRowText, searchValue);
            }
            
            return false;
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
    });

    return (
        <div className="data-table-container">
            {/* Global Search */}
            <div className="table-controls">
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="table-search"
                        title="Type any keyword to search across all columns (e.g., year, name, title)"
                    />
                    {globalFilter && (
                        <button
                            className="clear-search"
                            onClick={() => setGlobalFilter('')}
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="table-info">
                        {table.getFilteredRowModel().rows.length !== filteredData.length ? (
                            <>
                                <span className="filtered-count">{table.getFilteredRowModel().rows.length}</span> of {filteredData.length} records
                            </>
                        ) : (
                            <>{filteredData.length} records</>
                        )}
                    </div>
                    {showAdvancedSearch && (
                        <button
                            className="advanced-search-btn"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            title="Advanced search options"
                        >
                            {showAdvanced ? '▼' : '▶'} Advanced
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Search Panel */}
            {showAdvancedSearch && showAdvanced && (
                <div className="advanced-search-panel">
                    <div className="advanced-search-field">
                        <label htmlFor="name-search">Search by Name:</label>
                        <input
                            id="name-search"
                            type="text"
                            value={nameSearch}
                            onChange={(e) => setNameSearch(e.target.value)}
                            placeholder="Enter person name (Nepali or English)..."
                            className="advanced-search-input"
                        />
                        {nameSearch && (
                            <button
                                className="clear-search"
                                onClick={() => setNameSearch('')}
                                title="Clear name search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={
                                                    header.column.getCanSort()
                                                        ? 'sortable-header'
                                                        : ''
                                                }
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: ' ↑',
                                                    desc: ' ↓',
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        )}
                                        {/* Column filters hidden - only global search is active */}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="table-pagination">
                <div className="pagination-controls">
                    <button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className="pagination-btn"
                    >
                        ⟪ First
                    </button>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="pagination-btn"
                    >
                        ← Previous
                    </button>
                    <span className="pagination-info">
                        {table.getPageCount() > 0 ? (
                            <>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</>
                        ) : (
                            <>No pages</>
                        )}
                    </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="pagination-btn"
                    >
                        Next →
                    </button>
                    <button
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        className="pagination-btn"
                    >
                        Last ⟫
                    </button>
                </div>
                <div className="page-size-selector">
                    <label>
                        Show:
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                            className="page-size-select"
                        >
                            {[10, 20, 30, 50, 100].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
        </div>
    );
}
