// frontend/src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ExpensesList from "./pages/ExpensesList";
import ExpenseForm from "./pages/ExpenseForm";
import ExpenseDetail from "./pages/ExpenseDetail";
import Budget from "./pages/Budget";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminInsights from "./pages/admin/Insights";
import AdminUsers from "./pages/admin/Users";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminCategories from "./pages/admin/Categories";
import AppLayout from "./components/AppLayout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensesList />} />
          <Route path="/expenses/new" element={<ExpenseForm />} />
          <Route path="/expenses/:id/edit" element={<ExpenseForm />} />
          <Route path="/expenses/:id" element={<ExpenseDetail />} />
          <Route path="/budget" element={<Budget />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="insights" replace />} />
              <Route path="insights" element={<AdminInsights />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="expenses" element={<AdminExpenses />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}