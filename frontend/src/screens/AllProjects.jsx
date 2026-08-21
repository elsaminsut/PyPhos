import { Link } from "react-router"
import { useEffect } from "react"

import CreateProjectDialog from "../components/CreateProjectDialog"
import Footer from "../components/Footer"
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard"

import { useProjects } from "../lib/useData"


const AllProjects = () => {
    const { data: projects, loading, error } = useProjects()

    useEffect(() => {
        document.title = "Pyphos - Your Projects"
    }, [])

    if (loading) return <p className="grid h-screen place-items-center">Loading...</p>
    if (error) return <div className="grid h-screen place-items-center"><p>Something went wrong.</p></div>
    
    return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="page-container flex-1 flex flex-col w-full">
            <header className="mb-8">
                <div className="flex justify-between items-center my-4">
                    <h1 className="text-xl font-semibold">Your Projects</h1>
                    <CreateProjectDialog />
                </div>
            </header>
            <div className="main-content flex-1 flex flex-col">
                { projects.length != 0 ?
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
                : <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p>No projects yet</p>
                    <CreateProjectDialog />
                </div>
                }
            </div>
        </main>
        <Footer />
    </div>
    )
}

export default AllProjects
