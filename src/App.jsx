import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ReportView from './pages/ReportView';
import ClientHistory from './pages/ClientHistory';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report/:id" element={<ReportView />} />
          <Route path="/history" element={<ClientHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
