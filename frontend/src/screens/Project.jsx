import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router"

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
import Footer from "../components/Footer"
import Header from "../components/Header";
import Map from "../components/Map";
import { Download, Pencil, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

import { AuthContext } from "../lib/auth-context"
import { downloadReport } from "../lib/api"
import { useProject, useReport, useScenarios } from "../lib/useData"
import { getCompassDirection } from "../components/AngleSlider"



const Project = () => {
    const { projectId } = useParams();
    const location = useLocation()
    const { token, isGuest } = useContext(AuthContext)
    const { data: project, loading: projLoading, error: projError } = useProject(projectId)
    const { data: scenarios, loading: scenLoading, error: scenError } = useScenarios(projectId, project?.is_demo)
    const getReport = useReport()
    
    const [projectName, setProjectName] = useState("")
    const [projectLocation, setProjectLocation] = useState("")
    const [projectCountryCode, setProjectCountryCode] = useState("")
    const [projectCoords, setProjectCoords] = useState({ lat: null, lon: null })
    const [loadedProjectId, setLoadedProjectId] = useState(null)

    useEffect(() => {
        document.title = `Pyphos - ${projectName || "Project"}`
    }, [projectName])

    const [selectedScenario, setSelectedScenario] = useState(null)
    const [report, setReport] = useState("")
    const [scenariosInitialized, setScenariosInitialized] = useState(false)

    if (project && project.id !== loadedProjectId) {
        setLoadedProjectId(project.id)
        setProjectName(project.name ?? "")
        setProjectLocation(project.location ?? "")
        setProjectCountryCode(project.country_code ?? "")
        setProjectCoords({ lat: project.lat ?? null, lon: project.lon ?? null })
    }

    if (scenarios && scenarios.length != 0 && !scenariosInitialized) {
        setScenariosInitialized(true)
        const preselected = location.state?.selectedScenarioId
            && scenarios.find((s) => s.id === location.state.selectedScenarioId)
        setSelectedScenario(preselected || scenarios.at(0))
    }

    useEffect(() => {
        if (!selectedScenario) return

        const fetchReport = async () => {
            try {
                const data = await getReport(projectId, selectedScenario.id, project?.is_demo)
                setReport(data)
            } catch (_error) {
                setReport(null)
            }
        }
        fetchReport()
    }, [selectedScenario])

    if (projLoading || scenLoading) return <p className="grid h-screen place-items-center">Loading...</p>
    if (projError || scenError) return <div className="grid h-screen place-items-center"><p>Something went wrong.</p></div>

    function handleProjectSaved(updated) {
        setProjectName(updated.name ?? "")
        setProjectLocation(updated.location ?? "")
        setProjectCountryCode(updated.country_code ?? "")
        setProjectCoords({ lat: updated.lat ?? null, lon: updated.lon ?? null })
    }

    async function pdfDownload() {
        if (!selectedScenario) return

        try {
            const blob = await downloadReport(token, projectId, selectedScenario.id)
            const url = URL.createObjectURL(blob)

            const link = document.createElement("a")
            link.href = url
            link.download = `${projectName || "report"}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            URL.revokeObjectURL(url)
        } catch (_error) {
            toast.error("Failed to download report", { position: "top-center" })
        }
    }

    return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="page-container flex-1 flex flex-col w-full">
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
                    <h1 className="text-xl font-semibold">{projectName}</h1>
                    <EditProjectDialog onSaved={handleProjectSaved} />
                </div>
            </header>
            <div className="main-content flex-1 flex flex-col">
                <div className="flex flex-col gap-4 my-4">
                    <h3>{projectCountryCode ? `${projectLocation}, ${projectCountryCode}` : projectLocation}</h3>
                    <div className="isolate">
                        <Map lat={projectCoords.lat} lon={projectCoords.lon} className="h-40 w-full rounded-lg border border-border" />
                    </div>
                </div>
                    {scenarios.length != 0 ?
                        (selectedScenario ?
                        <div id="report">
                            <div id="tabs-section" className={`flex justify-between sticky ${isGuest ? "top-[var(--header-height-guest)]" : "top-[var(--header-height)]"} bg-background z-50`}>
                                <Tabs
                                    value={selectedScenario.id}
                                    className="flex flex-nowrap gap-4 overflow-x-auto border-b border-border
                                scrollbar-none  ">
                                    <TabsList variant="line">
                                        {scenarios.map(scenario => (
                                            <TabsTrigger
                                                value={scenario.id}
                                                key={scenario.id}
                                                onClick={() => setSelectedScenario(scenario)}
                                            >{scenario.name}</TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                                <div className="flex flex-nowrap gap-2">
                                    { !project.is_demo && 
                                    <div className="action-buttons flex flex-nowrap gap-2">
                                        <Tooltip>
                                            <TooltipTrigger render={
                                                <Link to={`/projects/${project.id}/scenarios/create`}>
                                                    <Button size="icon" variant="outline"><Plus/></Button>
                                                </Link>
                                            } />
                                            <TooltipContent>
                                                <p>Create scenario</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger render={
                                                <Link to={`/projects/${project.id}/scenarios/${selectedScenario.id}`}>
                                                    <Button size="icon" variant="outline"><Pencil/></Button>
                                                </Link>
                                            } />
                                            <TooltipContent>
                                                <p>Edit scenario</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    }
                                    <Tooltip>
                                        <TooltipTrigger render={
                                            <Button size="icon" variant="outline" onClick={pdfDownload}><Download/></Button>
                                        } />
                                        <TooltipContent>
                                            <p>Export report</p>
                                        </TooltipContent>
                                    </Tooltip>
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
                                                <TableCell>{(selectedScenario.installed_power / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} kWp</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-semibold">Tilt</TableCell>
                                                <TableCell>{selectedScenario.tilt}°</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-semibold">Azimuth</TableCell>
                                                <TableCell>{selectedScenario.azimuth}°{` · ${getCompassDirection(selectedScenario.azimuth)}`}</TableCell>
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
                                                <TableCell>{selectedScenario.module?.efficiency}%</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                                { report &&
                                <div id="output" className="flex flex-col gap-4">
                                    <div>
                                        <ChartBarInteractive height={250} data={report.chart_data} />
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
                                                        <span className="text-4xl font-bold">{report.specific_yield}</span>
                                                        <span className="text-sm text-muted-foreground">kWh/kWp</span>
                                                    </div>
                                                    <Progress value={Math.min(100, (report.specific_yield / report.radiation) * 100)} />
                                                    <p className="text-xs text-muted-foreground">
                                                        This figure represents the system performance relative to the module's rated capacity
                                                    </p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader>
                                                    <CardDescription>Performance ratio</CardDescription>
                                                </CardHeader>
                                                <CardContent className="flex flex-col gap-3">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-4xl font-bold">{report.perf_ratio}</span>
                                                        <span className="text-sm text-muted-foreground">%</span>
                                                    </div>
                                                    <Progress value={Math.min(100, Math.max(0, report.perf_ratio))} />
                                                    <p className="text-xs text-muted-foreground">
                                                        This figure represents the system performance relative to the location's maximum theoretical output
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
                    : <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <p>No scenarios yet</p>
                        <Link  to={`/projects/${project.id}/scenarios/create`}>
                            <Button>Create Scenario</Button>
                        </Link>
                    </div>}
            </div>
        </main>
        <Footer />
    </div>
    )
}

export default Project