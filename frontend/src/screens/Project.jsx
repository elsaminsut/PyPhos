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
import { ChartBarInteractive } from "../components/BarChart";
import EditProjectDialog from "../components/EditProjectDialog"
import Header from "../components/Header";
import Map from "../components/Map";
import { Pencil, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"


import { AuthContext } from "../lib/AuthContext"
import { useApi, getReport } from "../lib/api"



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

    function handleProjectSaved(updated) {
        setProjectName(updated.name ?? "")
        setProjectLocation(updated.location ?? "")
        setProjectCoords({ lat: updated.lat ?? null, lon: updated.lon ?? null })
    }

    return (
    <>
        <Header />
        <main className="max-w-[1000px] mx-auto px-8">
            <header className="flex-col">
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
                    <h1>{projectName}</h1>
                    <EditProjectDialog onSaved={handleProjectSaved} />
                </div>
            </header>
            <div className="main-content">
                <div className="flex flex-col gap-4 my-4">
                    <h3>{projectLocation}</h3>
                    <div className="isolate">
                        <Map lat={projectCoords.lat} lon={projectCoords.lon} className="h-40 w-full rounded-lg border border-border" />
                    </div>
                </div>
                    {scenarios.length != 0 ?
                        (selectedScenario ?
                        <div id="report">
                            <div id="tabs-section" className="flex justify-between sticky top-16 bg-background z-50">
                                <Tabs defaultValue="overview" className="flex flex-nowrap gap-4 overflow-x-auto border-b border-border 
                                scrollbar-none  ">
                                    <TabsList variant="line">
                                        {scenarios.map(scenario => (
                                            <TabsTrigger value={scenario.name} key={scenario.id}
                                            onClick={(e) => setSelectedScenario(scenario)}
                                            >{scenario.name}</TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                                <div className="flex flex-nowrap">
                                    <Link to={`/projects/${project.id}/scenarios/create`}>
                                        <Button variant="outline"><Plus/></Button>
                                    </Link>
                                    <Link to={`/projects/${project.id}/scenarios/${selectedScenario.id}`}>
                                        <Button variant="outline"><Pencil/></Button>
                                    </Link>
                                </div>
                            </div>
                            <div id="report-content" className="flex flex-col gap-4 my-8">
                                <div className="flex justify-between">
                                    <h3>{selectedScenario.name}</h3>
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
                                        <div className="grid grid-cols-2 gap-12">
                                            <Card>
                                                <CardHeader>
                                                    <CardDescription>Specific yield</CardDescription>
                                                </CardHeader>
                                                <CardContent className="flex flex-col gap-3">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-4xl font-bold tabular-nums">{report.specific_yield}</span>
                                                        <span className="text-sm text-muted-foreground">kWh/kWp</span>
                                                    </div>
                                                    <Progress value={Math.min(100, (report.specific_yield / report.radiation) * 100)} />
                                                    <p className="text-xs text-muted-foreground">
                                                        This figure represents the system perfomance relative to the module's rated capacity.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader>
                                                    <CardDescription>Performance ratio</CardDescription>
                                                </CardHeader>
                                                <CardContent className="flex flex-col gap-3">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-4xl font-bold tabular-nums">{report.perf_ratio}</span>
                                                        <span className="text-sm text-muted-foreground">%</span>
                                                    </div>
                                                    <Progress value={Math.min(100, Math.max(0, report.perf_ratio))} />
                                                    <p className="text-xs text-muted-foreground">
                                                        This figure represents the system perfomance relative to the location's maximum theoretical output.
                                                    </p>
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