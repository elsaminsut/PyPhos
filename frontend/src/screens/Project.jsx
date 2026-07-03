import { useContext, useEffect, useState } from "react"
import { Link, useParams } from "react-router"

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
import ScenarioCard from "../components/ScenarioCard";

import { AuthContext } from "../lib/AuthContext"
import { useApi, updateResourceField } from "../lib/api"


const Project = () => {
    const { projectId, scenarioId } = useParams();
    const { token } = useContext(AuthContext)
    const { data: project, loading: projLoading, error: projError } = useApi(`/api/projects/${projectId}`)
    const { data: scenarios, loading: scenLoading, error: scenError } = useApi(`/api/projects/${projectId}/scenarios`)
    
    const [projectName, setProjectName] = useState("")
    const [projectLocation, setProjectLocation] = useState("")

    useEffect(() => {
        if (project) {
            setProjectName(project.name ?? "")
            setProjectLocation(project.location ?? "")
        }
    }, [project])

    useEffect(() => {
        if (project) setProjectLocation(project.location)
    }, [project])

    if (projLoading || scenLoading) return <p>Loading...</p>
    if (projError || scenError) return <p>Something went wrong.</p>
    
    async function handleNameSubmit(e) {
        e.preventDefault()

        try {
            await updateResourceField(token, `/projects/${projectId}`, "name", projectName, { trim: true })
        } catch (error) {
            console.error("Error updating project name:", error)
        }
        console.log("Project name updated:", projectName)
    }

    async function handleLocationSubmit(e) {
        e.preventDefault()

        try {
            await updateResourceField(token, `/projects/${projectId}`, "location", projectLocation, { trim: true })
        } catch (error) {
            console.error("Error updating project location:", error)
        }
        console.log("Location updated:", projectLocation)
    }

    return (
    <>
        <Header />
        <main className="p-8">
            <header className="flex-col mb-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                        <BreadcrumbLink href="/projects">Your projects</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        <BreadcrumbPage>Project {project.id}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex justify-between items-center">
                    <form onSubmit={handleNameSubmit}>
                        <input id="projectName"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                    </form>
                    <Link key={project.id} to={`/projects/${project.id}/scenarios/create`}>
                        <Button >New Scenario</Button>    
                    </Link>
                </div>
            </header>
            <div className="main-content">
                <div className="flex justify-between items-center my-8">
                    <div>
                        <p>Location</p>
                        <form onSubmit={handleLocationSubmit}>
                            <input id="projectLocation"
                                value={projectLocation}
                                onChange={(e) => setProjectLocation(e.target.value)}
                            />
                        </form>
                    </div>
                    <div className="bg-yellow-800 h-10 w-100 ">MAP</div>
                </div>
                    {scenarios.length != 0 ?
                        <div className="grid grid-cols-2 gap-4">
                            {scenarios.map(scenario => (
                                <Link className="w-full" key={scenario.id} to={`/projects/${project.id}/scenarios/${scenario.id}`}>
                                    <ScenarioCard
                                        id={scenario.id}
                                        name={scenario.name} 
                                        />
                                </Link>
                            ))}
                        </div>
                    : <p className="text-center">No scenarios yet</p>}
            </div>
        </main>
    </>
    )
}

export default Project