import { useContext } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router"

import { AuthProvider, AuthContext } from './lib/AuthContext';
import { isTokenValid } from './lib/utils';
import { Toaster } from '@/components/ui/sonner'
import Landing from './screens/Landing'
import Login from './screens/Login'
import Signup from './screens/Signup'
import AllProjects from './screens/AllProjects'
import Project from './screens/Project'
import CreateScenario from './screens/CreateScenario'
import Report from './screens/Report'
import Scenario from './screens/Scenario'
import Settings from './screens/Settings'

import './App.css'

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                    <Route path="/projects" element={<GuestOrPrivateRoute><AllProjects /></GuestOrPrivateRoute>} />
                    <Route path="/projects/:projectId" element={<GuestOrPrivateRoute><Project /></GuestOrPrivateRoute>} />
                    <Route path="/projects/:projectId/scenarios/create" element={<GuestOrPrivateRoute><CreateScenario /></GuestOrPrivateRoute>} />
                    <Route path="/projects/:projectId/scenarios/:scenarioId" element={<GuestOrPrivateRoute><Scenario /></GuestOrPrivateRoute>} />
                    <Route path="/projects/:projectId/scenarios/:scenarioId/report" element={<PrivateRoute><Report /></PrivateRoute>} />
                </Routes>
            </Router>
            <Toaster />
        </AuthProvider>
    )
}

const GuestOrPrivateRoute = ({ children }) => {
  const { isGuest, token } = useContext(AuthContext);
  return isGuest || isTokenValid(token) ? children : <Navigate to="/login" />
};

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return isTokenValid(token) ? children : <Navigate to="/login" />
};
