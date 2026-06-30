import { useState, useEffect } from 'react';
import './ExpenseManager.css';

const API_URL = 'http://localhost:5000/api/transactions';

export default function ExpenseManager() {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

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
      if (editingId) {
        transaction.id = editingId;
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
        if (response.ok) {
          setEditingId(null);
          setFormData({ amount: '', description: '' });
          fetchTransactions();
        }
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
        if (response.ok) {
          setFormData({ amount: '', description: '' });
          fetchTransactions();
        }
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
        method: 'DELETE'
      });
      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  return (
    <div className="expense-container">
      <div className="expense-card">
        <h2>{editingId ? 'Sửa Khoản Chi' : 'Thêm Khoản Chi Mới'}</h2>
        <form onSubmit={handleSubmit} className="expense-form">
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
          <div className="form-group">
            <label>Mô tả</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="VD: Ăn trưa"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Cập Nhật' : 'Thêm'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ amount: '', description: '' });
                }}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="expense-list-container">
        <h2>Danh Sách Khoản Chi</h2>
        {transactions.length === 0 ? (
          <p className="no-data">Chưa có dữ liệu giao dịch.</p>
        ) : (
          <ul className="expense-list">
            {transactions.map((t) => (
              <li key={t.id} className="expense-item">
                <div className="expense-info">
                  <span className="expense-desc">{t.description}</span>
                  <span className="expense-date">{new Date(t.date).toLocaleString()}</span>
                </div>
                <div className="expense-amount-actions">
                  <span className="expense-amount">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                  </span>
                  <div className="actions">
                    <button className="btn-icon edit" onClick={() => handleEdit(t)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(t.id)}>🗑️</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
