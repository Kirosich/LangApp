import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import Quiz from './pages/Quiz';
import Browse from './pages/Browse';
import AddCard from './pages/AddCard';
import Theory from './pages/Theory';
import TheoryCourse from './pages/TheoryCourse';
import TheoryBlock from './pages/TheoryBlock';
import TheoryTopic from './pages/TheoryTopic';
import DialogueDetail from './pages/DialogueDetail';
import ReadingDetail from './pages/ReadingDetail';
import Settings from './pages/Settings';
import KnownWords from './pages/KnownWords';

function ProtectedRoute({ children }) {
  const { authed } = useAuth();
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="study" element={<Study />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="browse" element={<Browse />} />
        <Route path="cards/new" element={<AddCard />} />
        <Route path="cards/:id/edit" element={<AddCard />} />
        <Route path="theory" element={<Theory />} />
        <Route path="theory/courses/:id" element={<TheoryCourse />} />
        <Route path="theory/blocks/:id" element={<TheoryBlock />} />
        <Route path="theory/topics/:slug" element={<TheoryTopic />} />
        <Route path="theory/dialogues/:slug" element={<DialogueDetail />} />
        <Route path="theory/reading/:slug" element={<ReadingDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="known" element={<KnownWords />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
