import { Routes, Route } from 'react-router-dom';
import Signup from './views/Signup';
import Dashboard from './views/Dashboard';

function App() {


  return (

      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
  );
}

export default App;
