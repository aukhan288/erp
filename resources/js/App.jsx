import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Sprints from "./pages/Sprints";
import Milestones from "./components/tables/MilestonesTable";
import Profile from './pages/Profile';

import Tasks from "./pages/Tasks";
import Todos from "./pages/Todos";
import ProjectDetails from './pages/ProjectDetails';
import Login from "./pages/Login";

import { fetchUser } from './store/slices/authSlice';

function AppRoutes() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUser()); // 🔹 ensures user is loaded on refresh
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>; // optional loading state
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public login route */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={user ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="projects" element={<Projects />} />
          <Route path="milestones" element={<Milestones />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="sprints" element={<Sprints />} />
          <Route path="todos" element={<Todos />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;