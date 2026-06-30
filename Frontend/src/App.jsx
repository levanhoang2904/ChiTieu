import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ExpenseManager from './components/ExpenseManager';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

// Component bảo vệ Route: Nếu chưa có token thì chuyển về Login
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <h1>Quản Lý Chi Tiêu</h1>
          <p>Theo dõi các khoản chi tiêu của bạn một cách dễ dàng và hiệu quả</p>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <ExpenseManager />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
