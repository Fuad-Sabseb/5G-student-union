import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Leadership from './pages/Leadership';
import NewsEvents from './pages/NewsEvents';
import NewsEventDetail from './pages/NewsEventDetail';
import Resources from './pages/Resources';
import Forum from './pages/Forum';
import ForumTopicDetail from './pages/ForumTopicDetail';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import BlogCreate from './pages/BlogCreate';
import Support from './pages/Support';
import SupportDetail from './pages/SupportDetail';
import Dashboard from './pages/Dashboard';
import Alumni from './pages/Alumni';
import Offline from './pages/Offline';

import AdminMembers from './pages/admin/AdminMembers';
import AdminAlumni from './pages/admin/AdminAlumni';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnnouncementForm from './pages/admin/AdminAnnouncementForm';
import AdminGallery from './pages/admin/AdminGallery';
import AdminBlog from './pages/admin/AdminBlog';
import AdminSupport from './pages/admin/AdminSupport';
import AdminSupportDetail from './pages/admin/AdminSupportDetail';

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.warn('VITE_GOOGLE_CLIENT_ID is not configured. Google Sign-In will not work.');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/membership" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/offline" element={<Offline />} />

              {/* Protected browsing routes — require registration / login before browsing */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/about"
                element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leadership"
                element={
                  <ProtectedRoute>
                    <Leadership />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alumni"
                element={
                  <ProtectedRoute>
                    <Alumni />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news"
                element={
                  <ProtectedRoute>
                    <NewsEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news/:id"
                element={
                  <ProtectedRoute>
                    <NewsEventDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <ProtectedRoute>
                    <Resources />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <Forum />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community/:id"
                element={
                  <ProtectedRoute>
                    <ForumTopicDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <Gallery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blog"
                element={
                  <ProtectedRoute>
                    <Blog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blog/:id"
                element={
                  <ProtectedRoute>
                    <BlogDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blog/new"
                element={
                  <ProtectedRoute>
                    <BlogCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <Support />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support/:id"
                element={
                  <ProtectedRoute>
                    <SupportDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* --- Admin area (role === 'admin' only) --- */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/members" replace />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="alumni" element={<AdminAlumni />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="announcements/new" element={<AdminAnnouncementForm />} />
              <Route path="announcements/:id/edit" element={<AdminAnnouncementForm />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="support/:id" element={<AdminSupportDetail />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
