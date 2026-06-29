import React, { useContext, useEffect, useState } from "react"

import { AuthContext } from "../lib/AuthContext";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import { Button } from "@/components/ui/button"

import './screens.css'

const AllProjects = () => {
    const { token } = useContext(AuthContext);
    const [projects, setProjects] = useState([])
    
    useEffect(() => {
        const fetchProtectedContent = async () => {
            try {
                const response = await fetch("/api/projects/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                setProjects('You are not allowed to view this content.');
            }
        };
        
        fetchProtectedContent();
    }, [token])
    
    const projectList = projects.map(project => (
        <ProjectCard
            key={project.id}
            name={project.name} 
            location={project.location} />
    ))
    
    return (
    <>
        <Header />
        <main>
            <header className="main-header">
                <h1>Your Projects</h1>
                <Button>New Project</Button>
            </header>
            <div className="main-content">
                <div className="flex flex-row gap-4">
                    {projectList}
                </div>
            </div>
        </main>
    </>
    )
}

export default AllProjects
