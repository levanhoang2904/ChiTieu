import ExpenseManager from './components/ExpenseManager';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Quản Lý Chi Tiêu</h1>
        <p>Theo dõi các khoản chi tiêu của bạn một cách dễ dàng và hiệu quả</p>
      </header>
      <main className="app-main">
        <ExpenseManager />
      </main>
    </div>
  );
}

export default App;
