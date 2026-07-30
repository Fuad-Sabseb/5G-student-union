import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Leadership from './pages/Leadership';
import NewsEvents from './pages/NewsEvents';
import NewsEventDetail from './pages/NewsEventDetail';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import BlogCreate from './pages/BlogCreate';
import Support from './pages/Support';
import Dashboard from './pages/Dashboard';

import AdminMembers from './pages/admin/AdminMembers';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnnouncementForm from './pages/admin/AdminAnnouncementForm';
import AdminGallery from './pages/admin/AdminGallery';
import AdminBlog from './pages/admin/AdminBlog';
import AdminSupport from './pages/admin/AdminSupport';
import AdminSupportDetail from './pages/admin/AdminSupportDetail';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            {/* Membership sign-up is the same form as Join Us */}
            <Route path="/membership" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route path="/leadership" element={<Leadership />} />

            <Route path="/news" element={<NewsEvents />} />
            <Route path="/news/:id" element={<NewsEventDetail />} />

            <Route path="/gallery" element={<Gallery />} />

            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route
              path="/blog/new"
              element={
                <ProtectedRoute>
                  <BlogCreate />
                </ProtectedRoute>
              }
            />

            <Route path="/support" element={<Support />} />

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
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="announcements/new" element={<AdminAnnouncementForm />} />
            <Route path="announcements/:id/edit" element={<AdminAnnouncementForm />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="support/:id" element={<AdminSupportDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
