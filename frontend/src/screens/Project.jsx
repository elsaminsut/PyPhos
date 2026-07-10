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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card"
import Header from "../components/Header";
import { Input } from "@/components/ui/input"
import Map from "../components/Map";
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
    const [projectCoords, setProjectCoords] = useState({ lat: null, lon: null })

    const [selectedScenario, setSelectedScenario] = useState(null)
    const [report, setReport] = useState("")

    useEffect(() => {
        if (project) {
            setProjectName(project.name ?? "")
            setProjectLocation(project.location ?? "")
            setProjectCoords({ lat: project.lat ?? null, lon: project.lon ?? null })
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
            const updated = await updateResourceField(token, `/projects/${projectId}`, "city_input", projectLocation, { trim: true })
            setProjectLocation(updated.location ?? "")
            setProjectCoords({ lat: updated.lat ?? null, lon: updated.lon ?? null })
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
                <Breadcrumb className="my-4">
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
                        <Input id="projectName"
                            value={projectName}
                            onBlur={handleNameSubmit}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleNameSubmit(e)
                                }
                            }}
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
                        <form onSubmit={handleLocationSubmit} onBlur={handleLocationSubmit}>
                            <Input id="projectLocation"
                                value={projectLocation}
                                onChange={(e) => setProjectLocation(e.target.value)}
                            />
                        </form>
                    </div>
                    <Map lat={projectCoords.lat} lon={projectCoords.lon} className="h-40 w-120 rounded-lg border border-border" />
                </div>
                    {scenarios.length != 0 ?
                        (selectedScenario ?
                        <div id="report">
                            <div id="name-tabs" className="flex flex-nowrap gap-4 overflow-x-auto border-b border-border scrollbar-none">
                                {scenarios.map(scenario => (
                                    <Button
                                        variant={selectedScenario.id === scenario.id ? "secondary" : "ghost"}
                                        key={scenario.id}
                                        onClick={(e) => setSelectedScenario(scenario)}
                                    >
                                        {scenario.name}
                                    </Button>
                                ))}
                            </div>
                            <div id="report-content" className="flex flex-col gap-4 my-8">
                                <div className="flex justify-between">
                                    <div>{selectedScenario.name}</div>
                                    <Link  to={`/projects/${project.id}/scenarios/${selectedScenario.id}`}>
                                        <Button variant="secondary">Edit scenario</Button>
                                    </Link>
                                </div>
                                <div className="flex gap-8 w-full">
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card>
                                                <CardHeader>
                                                    <CardDescription>Specific yield</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-4xl font-bold tabular-nums">{report.specific_yield}</span>
                                                        <span className="text-sm text-muted-foreground">kWh/kWp</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader>
                                                    <CardDescription>Performance ratio</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-4xl font-bold tabular-nums">{report.perf_ratio}</span>
                                                        <span className="text-sm text-muted-foreground">%</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
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