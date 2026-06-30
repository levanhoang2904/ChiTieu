import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5162/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Đăng ký thành công! Vui lòng đăng nhập bằng tài khoản mới.');
        navigate('/login');
      } else {
        const errText = await response.text();
        setError(errText || 'Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.');
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-white text-2xl font-bold">CT</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Tạo tài khoản mới</h2>
          <p className="text-slate-400 mt-2">Điền thông tin bên dưới để đăng ký</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r text-red-400 text-sm flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Chọn tên đăng nhập"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all shadow-lg shadow-blue-500/20"
          >
            Đăng Ký Ngay
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
