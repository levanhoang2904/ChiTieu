import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
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
      const response = await fetch('http://localhost:5162/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        navigate('/');
      } else {
        const errText = await response.text();
        setError(errText || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
          <h2 className="text-2xl font-bold text-white">Chào mừng trở lại</h2>
          <p className="text-slate-400 mt-2">Vui lòng đăng nhập vào tài khoản của bạn</p>
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
              placeholder="Nhập tên đăng nhập"
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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-800" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer">Ghi nhớ</label>
            </div>
            <a href="#" className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all shadow-lg shadow-blue-500/20"
          >
            Đăng nhập
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
            Tạo tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
}
