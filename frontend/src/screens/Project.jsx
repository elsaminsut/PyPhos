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
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableRow,
} from "@/components/ui/table"

import { AuthContext } from "../lib/AuthContext"
import { useApi, updateResourceField, getReport } from "../lib/api"
import { ChartBarInteractive } from "../components/BarChart";


const Project = () => {
    const { projectId } = useParams();
    const { token } = useContext(AuthContext)
    const { data: project, loading: projLoading, error: projError } = useApi(`/api/projects/${projectId}`)
    const { data: scenarios, loading: scenLoading, error: scenError } = useApi(`/api/projects/${projectId}/scenarios`)
    
    const [projectName, setProjectName] = useState("")
    const [projectLocation, setProjectLocation] = useState("")
    
    const [selectedScenario, setSelectedScenario] = useState(null)
    const [report, setReport] = useState("")

    useEffect(() => {
        if (project) {
            setProjectName(project.name ?? "")
            setProjectLocation(project.location ?? "")
        }
    }, [project])

    useEffect(() => {
        if (scenarios && scenarios.length != 0) {
            setSelectedScenario(scenarios.at(0))
        }
    }, [scenarios])

    useEffect(() => {
        if (!selectedScenario) return

        const fetchReport = async () => {
            try {
                const data = await getReport(token, projectId, selectedScenario.id)
                setReport(data)
            } catch (error) {
                setReport(null)
            }
        }

        fetchReport()
    }, [selectedScenario])

    console.log("Selected scenario:", selectedScenario)
    console.log("Report: ", report)


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
        <main className="max-w-[1000px] mx-auto px-8">
            <header className="flex-col mb-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                        <BreadcrumbLink href="/projects">Your projects</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        <BreadcrumbPage>{project.name}</BreadcrumbPage>
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
                    <div className="bg-gray-200 h-10 w-100 ">MAP</div>
                </div>
                    {scenarios.length != 0 ?
                        (selectedScenario ?
                        <div id="report">
                            <div id="name-tabs" className="flex flex-wrap gap-4">
                                {scenarios.map(scenario => (
                                    <Button variant="ghost" key={scenario.id} onClick={(e) => setSelectedScenario(scenario)}>
                                        {scenario.name}
                                    </Button>
                                ))}
                            </div>
                            <div id="report-content" className="flex flex-col gap-4">
                                <div className="flex justify-between">
                                    <div>{selectedScenario.name}</div>
                                    <Link  to={`/projects/${project.id}/scenarios/${selectedScenario.id}`}>
                                        <Button variant="secondary">Edit scenario</Button>
                                    </Link>
                                </div>
                                <div className="flex gap-8 w-4/5">
                                    <Table>
                                        <TableCaption>System configuration</TableCaption>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-semibold">Module amount</TableCell>
                                                <TableCell>{selectedScenario.module_amount} modules</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-semibold">Installed power</TableCell>
                                                <TableCell>{selectedScenario.installed_power} kWp</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-semibold">Tilt</TableCell>
                                                <TableCell>{selectedScenario.tilt}°</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-semibold">Azimuth</TableCell>
                                                <TableCell>{selectedScenario.azimuth}°</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <Table>
                                        <TableCaption>Solar module</TableCaption>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="font-semibold">Manufacturer</TableCell>
                                                <TableCell>{selectedScenario.module?.manufacturer}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-semibold">Model</TableCell>
                                                <TableCell>{selectedScenario.module?.model}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-semibold">Nominal power</TableCell>
                                                <TableCell>{selectedScenario.module?.nominal_power} Wp</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-semibold">Efficiency</TableCell>
                                                <TableCell>13%</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                                { report &&
                                <div id="output" className="flex flex-col gap-4">
                                    <div>
                                                <ChartBarInteractive data={report.chart_data} />
                                    </div>
                                    <div>
                                        <div>
                                            System performance
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p>Specific yield</p>
                                            <div className="flex gap-2 text-xl font-bold">
                                                <div>{report.specific_yield}</div>
                                                <div>kWh/kWp</div>
                                            </div>
                                            <p>Performance ratio</p>
                                            <div className="flex gap-2 text-xl font-bold">
                                                <div>{report.perf_ratio}</div>
                                                <div>%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                }
                            </div>
                        </div>
                        : <p>Loading...</p>)
                    : <p className="text-center">No scenarios yet</p>}
            </div>
        </main>
    </>
    )
}

export default Project