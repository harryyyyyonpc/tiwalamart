import { BrowserRouter, Routes } from 'react-router';
import { routes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>{routes}</Routes>
    </BrowserRouter>
  );
}
