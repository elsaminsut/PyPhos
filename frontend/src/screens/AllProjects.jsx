import { Link } from "react-router"
import { useEffect } from "react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import CreateProjectDialog from "../components/CreateProjectDialog"
import { Button } from "@/components/ui/button"
import Footer from "../components/Footer"
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard"

import { useApi } from "../lib/api"


const AllProjects = () => {
    const { data: projects, loading, error } = useApi("/api/projects")

    useEffect(() => {
        document.title = "Pyphos - Your Projects"
    }, [])

    if (loading) return <p className="grid h-screen place-items-center">Loading...</p>
    if (error) return <div className="grid h-screen place-items-center"><p>Something went wrong.</p></div>
    
    return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="max-w-[1000px] mx-auto px-8 flex-1 flex flex-col w-full">
            <header className="mb-8">
                <div className="flex justify-between items-center my-4">
                    <h1>Your Projects</h1>
                    <CreateProjectDialog />
                </div>
            </header>
            <div className="main-content">
                <div className="grid grid-cols-3 gap-4">
                    {
                        projects.map(project => (
                            <Link key={project.id} to={`/projects/${project.id}`}>
                                <ProjectCard
                                    key={project.id}
                                    name={project.name}
                                    location={project.location}
                                    countryCode={project.country_code}
                                    scenarioCount={project.scenario_count} />
                            </Link>
                        ))
                    }
                </div>
            </div>
        </main>
        <Footer />
    </div>
    )
}

export default AllProjects
