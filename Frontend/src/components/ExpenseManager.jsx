import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, Receipt, CreditCard, LayoutDashboard, Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import './ExpenseManager.css';

const API_URL = 'http://localhost:5162/api/transactions';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', '#55E6C1', '#FF8ED4', '#A8E6CF'];

export default function ExpenseManager() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isIncomeForm, setIsIncomeForm] = useState(false);
  const [formData, setFormData] = useState({ amount: '', description: '', categoryId: '' });
  const [editingId, setEditingId] = useState(null);
  const [chartType, setChartType] = useState('expense'); // 'income' or 'expense'

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5162/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        // Default categoryId on load
        const expenseCats = data.filter(c => !c.isIncome);
        if (expenseCats.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: expenseCats[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // --- Computed Data for Dashboard ---
  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions.filter(t => !t.isIncome).reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);
  
  const balance = totalIncome - totalExpense;

  const pieChartData = useMemo(() => {
    const filtered = transactions.filter(t => (chartType === 'income' ? t.isIncome : !t.isIncome));
    const grouped = filtered.reduce((acc, t) => {
      const catName = t.category ? t.category.name : 'Khác';
      acc[catName] = (acc[catName] || 0) + t.amount;
      return acc;
    }, {});
    
    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    })).sort((a, b) => b.value - a.value); // Sort desc
  }, [transactions, chartType]);

  const dailyChartData = useMemo(() => {
    const expenses = transactions.filter(t => !t.isIncome);
    const daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const data = daysOfWeek.map(day => ({ name: day, value: 0 }));

    expenses.forEach(t => {
      const date = new Date(t.date);
      const dayIndex = date.getDay(); // 0 is Sunday
      data[dayIndex].value += t.amount;
    });

    // Chuyển Chủ nhật ra cuối
    const shiftedData = [...data.slice(1), data[0]];
    return shiftedData;
  }, [transactions]);

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  // ------------------------------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTabSwitch = (isIncome) => {
    setIsIncomeForm(isIncome);
    const availableCats = categories.filter(c => c.isIncome === isIncome);
    if (availableCats.length > 0) {
      setFormData({ ...formData, categoryId: availableCats[0].id.toString() });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    const transaction = {
      amount: parseFloat(formData.amount),
      description: formData.description || '',
      categoryId: isIncomeForm ? null : parseInt(formData.categoryId, 10),
      isIncome: isIncomeForm,
      date: new Date().toISOString()
    };

    try {
      if (editingId) {
        transaction.id = editingId;
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
        if (response.ok) {
          setEditingId(null);
          setFormData({ amount: '', description: '', categoryId: formData.categoryId });
          fetchTransactions();
        }
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
        if (response.ok) {
          setFormData({ amount: '', description: '', categoryId: formData.categoryId });
          fetchTransactions();
        }
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setIsIncomeForm(t.isIncome);
    setFormData({ amount: t.amount, description: t.description, categoryId: t.categoryId?.toString() || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const filteredCategories = categories.filter(c => c.isIncome === isIncomeForm);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <LayoutDashboard className="header-icon" />
        <h2>Tổng Quan Tài Chính</h2>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="summary-cards">
        <div className="card total-card gradient-income">
          <div className="card-icon"><TrendingUp size={28} /></div>
          <div className="card-info">
            <p>Tổng Thu</p>
            <h3>{formatVND(totalIncome)}</h3>
          </div>
        </div>
        <div className="card total-card gradient-expense">
          <div className="card-icon"><TrendingDown size={28} /></div>
          <div className="card-info">
            <p>Tổng Chi</p>
            <h3>{formatVND(totalExpense)}</h3>
          </div>
        </div>
        <div className="card total-card gradient-balance">
          <div className="card-icon"><Wallet size={28} /></div>
          <div className="card-info">
            <p>Số Dư</p>
            <h3>{formatVND(balance)}</h3>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="dashboard-grid">
        
        {/* Left Column: Form & Chart */}
        <div className="left-column">
          
          <div className="glass-panel chart-panel">
            <div className="chart-header">
              <h3>Cơ cấu {chartType === 'expense' ? 'Chi Tiêu' : 'Thu Nhập'}</h3>
              <div className="chart-tabs">
                <button 
                  className={`chart-tab ${chartType === 'expense' ? 'active' : ''}`}
                  onClick={() => setChartType('expense')}
                >Chi</button>
                <button 
                  className={`chart-tab ${chartType === 'income' ? 'active' : ''}`}
                  onClick={() => setChartType('income')}
                >Thu</button>
              </div>
            </div>
            
            <div className="chart-container">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatVND(value)}
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '8px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">Chưa có dữ liệu</p>
              )}
            </div>
          </div>

          <div className="glass-panel chart-panel">
            <h3>Chi tiêu theo ngày trong tuần</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#ccc" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ccc" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip 
                    formatter={(value) => formatVND(value)}
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '8px', border: 'none', color: '#fff' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="value" fill="#FF6B6B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel form-panel">
            <h3>{editingId ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch'}</h3>
            
            <div className="form-tabs">
              <button 
                className={`form-tab expense-tab ${!isIncomeForm ? 'active' : ''}`}
                onClick={() => handleTabSwitch(false)}
                type="button"
              >
                Khoản Chi
              </button>
              <button 
                className={`form-tab income-tab ${isIncomeForm ? 'active' : ''}`}
                onClick={() => handleTabSwitch(true)}
                type="button"
              >
                Khoản Thu
              </button>
            </div>

            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="VD: 50000"
                    required
                  />
                </div>
                {!isIncomeForm && (
                  <div className="form-group">
                    <label>Loại danh mục</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                    >
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Mô tả (Tùy chọn)</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="VD: Lương tháng 7"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className={`btn btn-primary ${isIncomeForm ? 'btn-income' : 'btn-expense'}`}>
                  {editingId ? <><Edit2 size={18}/> Cập Nhật</> : <><Plus size={18}/> Thêm mới</>}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ amount: '', description: '', categoryId: filteredCategories[0]?.id || '' });
                    }}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Transaction List */}
        <div className="glass-panel list-panel">
          <h3>Lịch Sử Giao Dịch</h3>
          {transactions.length === 0 ? (
            <p className="no-data">Chưa có dữ liệu.</p>
          ) : (
            <ul className="expense-list">
              {transactions.map((t) => (
                <li key={t.id} className="expense-item">
                  <div className="expense-info">
                    <div className="expense-header">
                      <span className="expense-desc">{t.description || (t.category ? t.category.name : 'Khác')}</span>
                      {t.category && (
                        <span className={`expense-category-badge ${t.isIncome ? 'badge-income' : 'badge-expense'}`}>
                          {t.category.icon} {t.category.name}
                        </span>
                      )}
                    </div>
                    <span className="expense-date">{new Date(t.date).toLocaleString()}</span>
                  </div>
                  <div className="expense-amount-actions">
                    <span className={`expense-amount ${t.isIncome ? 'amount-income' : 'amount-expense'}`}>
                      {t.isIncome ? '+' : '-'}{formatVND(t.amount)}
                    </span>
                    <div className="actions">
                      <button className="btn-icon edit" onClick={() => handleEdit(t)} title="Sửa"><Edit2 size={16}/></button>
                      <button className="btn-icon delete" onClick={() => handleDelete(t.id)} title="Xóa"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
