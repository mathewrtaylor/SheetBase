import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, LayoutDashboard, PlusCircle, Loader2 } from 'lucide-react';
import { getTables } from '../api';

const Dashboard = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const tableList = await getTables();
        setTables(tableList);
      } catch (err) {
        console.error('Failed to fetch tables:', err);
        setError('Could not load tables. Please check your connection or login again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium tracking-wide">Loading tables...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SheetBase Dashboard</h1>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition shadow-sm active:scale-95">
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium">Sync from Sheets</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8 flex items-center justify-between">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="underline font-medium">Retry</button>
        </div>
      )}

      {tables.length === 0 && !error && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No tables found. Run the ingestion script to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((tableName) => (
          <Link
            key={tableName}
            to={`/table/${tableName}`}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition duration-300 group ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition">
                  <Table className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 capitalize group-hover:text-blue-700 transition">{tableName.replace(/_/g, ' ')}</h3>
                  <p className="text-sm text-gray-500">DuckDB Table</p>
                </div>
              </div>
              <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition transform translate-x-2 group-hover:translate-x-0">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
