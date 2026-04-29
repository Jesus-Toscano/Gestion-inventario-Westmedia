import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Almacenista from './pages/Almacenista';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Proyectos from './pages/Proyectos';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/almacenista" replace />} />
          <Route path="almacenista" element={<Almacenista />} />
          <Route path="admin" element={<Admin />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="proyectos" element={<Proyectos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
