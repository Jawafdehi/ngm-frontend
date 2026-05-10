import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import CaseDetailPage from './pages/CaseDetailPage';
import BrowsePage from './pages/BrowsePage';
import DatasetPage from './pages/DatasetPage';
import StatusPage from './pages/StatusPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/case/:court/:caseNumber" element={<CaseDetailPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/dataset" element={<DatasetPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
