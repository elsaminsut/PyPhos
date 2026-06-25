import './App.css'
import AllProjects from './screens/AllProjects'
import Project from './screens/Project'
import Scenario from './screens/Scenario'
import { BrowserRouter, Routes, Route } from "react-router"

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/projects" element={<AllProjects />} />
                <Route path="/projects/:projectId" element={<Project />} />
                <Route path="/projects/:projectId/scenarios/:scenarioId" element={<Scenario />} />
            </Routes>
        </BrowserRouter>
    )
}

