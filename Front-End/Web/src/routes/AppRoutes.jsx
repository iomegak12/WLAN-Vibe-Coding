import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardLayout from '../components/DashboardLayout';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import UsersListPage from '../features/users/pages/UsersListPage';
import RolesListPage from '../features/roles/pages/RolesListPage';
import RoleCreatePage from '../features/roles/pages/RoleCreatePage';
import RoleEditPage from '../features/roles/pages/RoleEditPage';
import CategoriesListPage from '../features/categories/pages/CategoriesListPage';
import SubCategoriesListPage from '../features/categories/pages/SubCategoriesListPage';
import ProductsListPage from '../features/products/pages/ProductsListPage';

// Placeholder components - will be created in later phases
const NotFoundPage = () => <div>404 - Page Not Found</div>;
const ForbiddenPage = () => <div>403 - Access Forbidden</div>;

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Users */}
          <Route
            path="users"
            element={
              <ProtectedRoute requiredPermission="users.read">
                <UsersListPage />
              </ProtectedRoute>
            }
          />

          {/* Roles */}
          <Route
            path="roles"
            element={
              <ProtectedRoute requiredPermission="roles.read">
                <RolesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="roles/create"
            element={
              <ProtectedRoute requiredPermission="roles.create">
                <RoleCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="roles/edit/:id"
            element={
              <ProtectedRoute requiredPermission="roles.update">
                <RoleEditPage />
              </ProtectedRoute>
            }
          />

          {/* Categories */}
          <Route
            path="categories"
            element={
              <ProtectedRoute requiredPermission="categories.read">
                <CategoriesListPage />
              </ProtectedRoute>
            }
          />

          {/* Subcategories */}
          <Route
            path="subcategories"
            element={
              <ProtectedRoute requiredPermission="subcategories.read">
                <SubCategoriesListPage />
              </ProtectedRoute>
            }
          />

          {/* Products */}
          <Route
            path="products"
            element={
              <ProtectedRoute requiredPermission="products.read">
                <ProductsListPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Error pages */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
