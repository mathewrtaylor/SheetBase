import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, FileText, Loader2, AlertCircle, Download } from 'lucide-react';
import { getTableData, downloadReport } from '../api';

const TableView = () => {
  const { tableName } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadReport(tableName);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate PDF. Check backend logs.');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rows = await getTableData(tableName);
        setData(rows);
      } catch (err) {
        console.error('Failed to fetch table data:', err);
        setError(`Could not load data for table "${tableName}".`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium tracking-wide">Loading {tableName}...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Link to="/" className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition duration-200 group">
            <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">{tableName.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-gray-500">{data.length} records found</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            <span>{exporting ? 'Generating...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 p-8 rounded-2xl flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Failed to load data</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition">Retry</button>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 rounded-2xl text-center">
          <p className="text-gray-500 font-medium">This table is empty.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden ring-1 ring-black/5">
          {/* Desktop View (Table) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th key={key} className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition duration-150">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {val === null || val === undefined ? '-' : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View (Cards) */}
          <div className="sm:hidden divide-y divide-gray-100">
            {data.map((row, i) => (
              <div key={i} className="p-5 space-y-3 bg-white hover:bg-gray-50 transition">
                {Object.entries(row).map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm text-gray-800 font-semibold">{val === null || val === undefined ? '-' : String(val)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableView;
