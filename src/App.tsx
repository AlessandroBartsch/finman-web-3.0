
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Loans from './pages/Loans';
import Installments from './pages/Installments';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/installments" element={<Installments />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
