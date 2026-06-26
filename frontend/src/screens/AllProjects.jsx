import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import './screens.css'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function AllProjects() {
    const [projects, setProjects] = useState([])

    useEffect(() => {
        fetch("/api/projects")
        .then(res => res.json())
        .then(data => setProjects(data))
    }, [])

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