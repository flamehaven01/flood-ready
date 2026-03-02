import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { QuickAssistEntry } from './pages/QuickAssistEntry';
import { QuickAssistFlow } from './pages/QuickAssistFlow';
import { AIQuickAssist } from './pages/AIQuickAssist';
import { Onboarding } from './pages/Onboarding';
import { Settings } from './pages/Settings';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { HubProvider } from './contexts/HubContext';
import { AIProvider } from './contexts/AIContext';

import { MapView } from './pages/MapView';
import { QRComms } from './pages/QRComms';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasCompletedOnboarding } = useTheme();
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <HubProvider>
        <AIProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Home />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/quick-assist" element={<QuickAssistEntry />} />
                <Route path="/ai-assist" element={<AIQuickAssist />} />
                <Route path="/quick-assist/:treeId" element={<QuickAssistFlow />} />
                <Route path="/qr-comms" element={<QRComms />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AIProvider>
      </HubProvider>
    </ThemeProvider>
  );
}

export default App;
