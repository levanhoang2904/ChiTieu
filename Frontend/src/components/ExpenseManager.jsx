import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5162/api/transactions';

export default function ExpenseManager() {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(API_URL, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        // Sort by date descending
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(sorted);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    const transaction = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: new Date().toISOString()
    };

    try {
      let response;
      if (editingId) {
        transaction.id = editingId;
        response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(transaction)
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(transaction)
        });
      }

      if (response.ok) {
        setEditingId(null);
        setFormData({ amount: '', description: '' });
        fetchTransactions();
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setFormData({ amount: t.amount, description: t.description });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        fetchTransactions();
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  // Tính toán thống kê
  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = transactions.length;
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      
      {/* Header / Navbar */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold">CT</span>
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">Quản Lý Chi Tiêu</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-slate-400">Xin chào, </span>
              <span className="font-semibold text-white">{username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors border border-red-500/20"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">💸</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Tổng Chi Tiêu</h3>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalExpense)}</p>
          </div>
          
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">📝</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Số Lượng Giao Dịch</h3>
            <p className="text-3xl font-bold text-white">{totalTransactions}</p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">⚡</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Trạng Thái</h3>
            <p className="text-3xl font-bold text-emerald-400">Đang đồng bộ</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingId ? 'Sửa Khoản Chi' : 'Thêm Giao Dịch Mới'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="VD: 50000"
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả giao dịch</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="VD: Ăn trưa, Đổ xăng..."
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/20"
                  >
                    {editingId ? 'Cập Nhật' : 'Thêm Mới'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ amount: '', description: '' });
                      }}
                      className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Lịch Sử Giao Dịch</h2>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-700">
                  <p className="text-slate-400">Bạn chưa có khoản chi nào. Hãy thêm một khoản chi mới nhé!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div 
                      key={t.id} 
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-center gap-4 mb-3 sm:mb-0">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl shadow-inner border border-slate-700">
                          💳
                        </div>
                        <div>
                          <p className="text-white font-medium text-lg">{t.description}</p>
                          <p className="text-sm text-slate-400">{formatDate(t.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <span className="text-xl font-bold text-rose-400">
                          - {formatCurrency(t.amount)}
                        </span>
                        
                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(t)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors"
                            title="Sửa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                            title="Xóa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
