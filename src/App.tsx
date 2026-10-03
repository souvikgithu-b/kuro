import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { PublicLayout } from './components/PublicLayout';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Movies = lazy(() => import('./pages/Movies').then((module) => ({ default: module.Movies })));
const MovieDetails = lazy(() => import('./pages/MovieDetails').then((module) => ({ default: module.MovieDetails })));
const Watch = lazy(() => import('./pages/Watch').then((module) => ({ default: module.Watch })));
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })));
const Login = lazy(() => import('./admin/Login').then((module) => ({ default: module.Login })));
const AdminLayout = lazy(() => import('./admin/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const Dashboard = lazy(() => import('./admin/Dashboard').then((module) => ({ default: module.Dashboard })));
const AdminMovies = lazy(() => import('./admin/Movies').then((module) => ({ default: module.Movies })));
const AddMovie = lazy(() => import('./admin/AddMovie').then((module) => ({ default: module.AddMovie })));
const EditMovie = lazy(() => import('./admin/EditMovie').then((module) => ({ default: module.EditMovie })));
const MonetizationSettings = lazy(() => import('./admin/MonetizationSettings').then((module) => ({ default: module.MonetizationSettings })));
const Analytics = lazy(() => import('./admin/Analytics').then((module) => ({ default: module.Analytics })));

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-ink-950 p-8 text-center font-mono text-xs text-ink-400">Loading archive...</div>}>
          <Routes>
            {/* Public Portal Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movie/:slug" element={<MovieDetails />} />
              <Route path="/watch/:slug" element={<Watch />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Login */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Console */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="movies/new" element={<AddMovie />} />
              <Route path="movies/:id/edit" element={<EditMovie />} />
              <Route path="settings/monetization" element={<MonetizationSettings />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
