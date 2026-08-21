import { useState } from "react"
import { useParams } from "react-router"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card"
import { ChartBarInteractive } from "../components/BarChart";
import Footer from "../components/Footer"
import Map from "../components/Map";
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableRow,
} from "@/components/ui/table"

import Logo from "../assets/pyphos-logo.svg"
import { useApi } from "../lib/api"
import "../styles/print.css"

export default function Report() {
    const { projectId, scenarioId } = useParams();
    const { data: project, loading: projLoading, error: projError } = useApi(`/api/projects/${projectId}`)
    const { data: scenario, loading: scenLoading, error: scenError } = useApi(`/api/projects/${projectId}/scenarios/${scenarioId}`)
    const { data: report } = useApi(`/api/projects/${projectId}/scenarios/${scenarioId}/report`)
    
    const [projectName, setProjectName] = useState("")
    const [projectLocation, setProjectLocation] = useState("")
    const [projectCountryCode, setProjectCountryCode] = useState("")
    const [projectCoords, setProjectCoords] = useState({ lat: null, lon: null })
    const [loadedProjectId, setLoadedProjectId] = useState(null)

    if (project && project.id !== loadedProjectId) {
        setLoadedProjectId(project.id)
        setProjectName(project.name ?? "")
        setProjectLocation(project.location ?? "")
        setProjectCountryCode(project.country_code ?? "")
        setProjectCoords({ lat: project.lat ?? null, lon: project.lon ?? null })
    }

    if (projLoading || scenLoading) return <p className="grid h-screen place-items-center">Loading...</p>
    if (projError || scenError) return <div className="grid h-screen place-items-center"><p>Something went wrong.</p></div>

    return (
        <div className="max-w-[754px] mx-auto flex flex-col">
            <header className="flex justify-end items-center px-8 py-4">
                <img src={Logo} alt="PyPhos Logo" className="h-8 w-auto"/>
            </header>
            <main className="px-8 flex-1 flex flex-col w-full">
            <header className="flex-col">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold">{projectName}</h1>
                </div>
            </header>
            <div className="main-content flex-1 flex flex-col">
                <div className="flex flex-col gap-4 my-4">
                    <h3>{projectCountryCode ? `${projectLocation}, ${projectCountryCode}` : projectLocation}</h3>
                    <div className="isolate">
                        <Map lat={projectCoords.lat} lon={projectCoords.lon} className="h-40 w-full rounded-lg border border-border" />
                    </div>
                </div>
                <div id="report">
                    <div id="report-content" className="flex flex-col gap-4 my-8">
                        <div className="flex justify-between">
                            <h3>{scenario.name}</h3>
                        </div>
                        <div className="flex gap-8 w-full">
                            <Table>
                                <TableCaption>System configuration</TableCaption>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-semibold">Module amount</TableCell>
                                        <TableCell>{scenario.module_amount} modules</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-semibold">Installed power</TableCell>
                                        <TableCell>{(scenario.installed_power / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} kWp</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-semibold">Tilt</TableCell>
                                        <TableCell>{scenario.tilt}°</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-semibold">Azimuth</TableCell>
                                        <TableCell>{scenario.azimuth}°</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <Table>
                                <TableCaption>Solar module</TableCaption>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-semibold">Manufacturer</TableCell>
                                        <TableCell>{scenario.module?.manufacturer}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-semibold">Model</TableCell>
                                        <TableCell>{scenario.module?.model}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-semibold">Nominal power</TableCell>
                                        <TableCell>{scenario.module?.nominal_power} Wp</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-semibold">Efficiency</TableCell>
                                        <TableCell>{scenario.module?.efficiency}%</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        { report &&
                        <div id="output" className="flex flex-col gap-4">
                            <div >
                                <ChartBarInteractive height={150} data={report.chart_data} />
                            </div>
                            <div className="page-break keep-together">
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
            </div>
        </main>
        <Footer />
    </div>
    )
}