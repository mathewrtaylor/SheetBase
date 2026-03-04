import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      // In development, this returns a token directly
      const response = await api.get('/auth/login');
      const { access_token } = response.data;
      
      localStorage.setItem('sheetbase_token', access_token);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl ring-1 ring-black/5">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">SheetBase</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Access your spreadsheet database</p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-70 active:scale-95 shadow-lg shadow-blue-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google logo" />
                Sign in with Google (Dev Mode)
              </>
            )}
          </button>
          <p className="mt-6 text-center text-xs text-gray-400">
            Secure authentication powered by SheetBase
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
