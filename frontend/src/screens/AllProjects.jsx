import { Link } from "react-router"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard"
import { useApi } from "../lib/useApi"


const AllProjects = () => {
    const { data: projects, loading, error } = useApi("/api/projects/")

    if (loading) return <p>Loading...</p>
    if (error) return <p>Something went wrong.</p>
    
    return (
    <>
        <Header />
        <main className="p-8"> 
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <h1>Your Projects</h1>
                    <Button>New Project</Button>
                </div>
            </header>
            <div className="main-content">
                <div className="flex flex-row gap-4">
                    {
                        projects.map(project => (
                            <Link className="w-full" key={project.id} to={`/projects/${project.id}`}>
                                <ProjectCard
                                    key={project.id}
                                    name={project.name} 
                                    location={project.location} />
                            </Link>
                        ))
                    }
                </div>
            </div>
        </main> 
    </>
    )
}

export default AllProjects
