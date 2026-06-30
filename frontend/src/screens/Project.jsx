import { useContext, useEffect, useState } from "react";
import { Link } from "react-router"
import { useParams } from "react-router";

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
import { useApi } from "../lib/useApi"


const Project = () => {
    const params = useParams();
    const { token } = useContext(AuthContext)
    const { data: project, loading: projLoading, error: projError } = useApi(`/api/projects/${params.projectId}`)
    const { data: scenarios, loading: scenLoading, error: scenError } = useApi(`/api/projects/${params.projectId}/scenarios/`)
    
    const [projectName, setProjectName] = useState("")

    useEffect(() => {
        if (project) setProjectName(project.name)
    }, [project])

    if (projLoading || scenLoading) return <p>Loading...</p>
    if (projError || scenError) return <p>Something went wrong.</p>
    

    async function handleNameSubmit(e) {
        e.preventDefault()

        if (!projectName.trim()) {
            console.error("Project name cannot be empty")
            return
        }

        try {
            const response = await fetch(`/api/projects/${params.projectId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: projectName.trim() })
            })

            if (!response.ok) {
                console.error("Failed to update project name")
            }
        } catch (error) {
            console.error("Error updating project name:", error)
        }
    }

    return (
    <>
        <Header />
        <main className="p-8">
            <header className="flex-col mb-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                        <BreadcrumbLink href="/projects/">Your projects</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        <BreadcrumbPage>Project {project.id}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex justify-between items-center">
                    <form onSubmit={handleNameSubmit}>
                        <input
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                    </form>
                    <Button>New Scenario</Button>
                </div>
            </header>
            {token ? 
            <div className="main-content">
                {/* <div>Location: {project.location}</div> */}
                <div className="flex flex-row gap-4">
                    {
                        scenarios.map(scenario => (
                            <Link className="w-full" key={scenario.id} to={`/projects/${project.id}`}>
                                <ScenarioCard
                                    key={scenario.id}
                                    id={scenario.id}
                                    name={scenario.name} 
                                    />
                            </Link>
                        ))
                    }
                </div>
                <p>{project.name}</p>
            </div>
            : <p>Back to Login</p> }
        </main>
    </>
    )
}

export default Project