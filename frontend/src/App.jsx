import React from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router"

import { AuthProvider, AuthContext } from './lib/AuthContext';
import AllProjects from './screens/AllProjects'
import Login from './screens/Login'
import Project from './screens/Project'
import Scenario from './screens/Scenario'

import './App.css'

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/projects" element={<PrivateRoute><AllProjects /></PrivateRoute>} />
                    <Route path="/projects/:projectId" element={<PrivateRoute><Project /></PrivateRoute>} />
                    <Route path="/projects/:projectId/scenarios/:scenarioId" element={<PrivateRoute><Scenario /></PrivateRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

const PrivateRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};
