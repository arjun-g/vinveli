import { Route, Routes } from 'react-router-dom';
import './app.css';
import { Auth } from './pages/auth';
import { Home } from './pages/home';
import { Ticket } from './pages/ticket';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/auth/*" element={<Auth />} />
        <Route path='/*' element={<Home />} />
        {/* <Route path='/ticket' element={} /> */}
      </Routes>
    </div>
  );
}

export default App;
