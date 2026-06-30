import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ExpenseManager from './components/ExpenseManager';
import Login from './components/Login';
import Register from './components/Register';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
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
      </div>
    </BrowserRouter>
  );
}

export default App;
