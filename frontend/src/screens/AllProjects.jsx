import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import './screens.css'
import { Button } from "@/components/ui/button"
import React, { useContext, useEffect, useState } from "react"

const AllProjects = () => {
    const { token } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [projects, setProjects] = useState([])
    
    useEffect(() => {
        const fetchProtectedContent = async () => {
            try {
                const response = await fetch("/api/projects", {
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

    console.log(projects)
    
    const projectList = projects.map(project => {
        <ProjectCard
            key={project.id}
            name={project.name} 
            location={project.location} />
    })
    
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
                    <ProjectCard />
                    <ProjectCard />
                </div>
            </div>
        </main>
    </>
    )
}

export default AllProjects
