import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { LandingPage } from './pages/LandingPage';
import { AnalyzePage } from './pages/AnalyzePage';

export function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
        <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/analyze"
              element={<AnalyzePage onOpenSettings={() => setIsSettingsOpen(true)} />}
            />
          </Routes>
        </main>

        <Footer />

        <ApiKeyModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </Router>
  );
}

export default App;
