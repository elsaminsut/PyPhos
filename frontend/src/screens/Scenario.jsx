import { useContext, useEffect, useState } from "react";
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
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import Header from "../components/Header";
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { AuthContext } from "../lib/AuthContext"
import { useApi, updateResourceField } from "../lib/api"

export default function Scenario() {
    const { projectId, scenarioId } = useParams();
    const { token } = useContext(AuthContext)
    const { data: project, loading: projLoading, error: projError } = useApi(`/api/projects/${projectId}`)
    const { data: scenario, loading: scenLoading, error: scenError } = useApi(`/api/projects/${projectId}/scenarios/${scenarioId}`)
    const { data: manufacturers } = useApi("/api/modules/manufacturers")
    
    const [scenarioName, setScenarioName] = useState("")
    const [moduleAmount, setModuleAmount] = useState("")
    const [tilt, setTilt] = useState("")
    const [azimuth, setAzimuth] = useState("")
    const [selectedManufacturer, setSelectedManufacturer] = useState("")
    const [selectedModel, setSelectedModel] = useState("")
    
    const { data: modules } = useApi(
        selectedManufacturer ? `/api/modules?manufacturer=${selectedManufacturer}` : null)
        
    useEffect(() => {
        if (scenario) {
                setScenarioName(scenario.name ?? "")
                setModuleAmount(scenario.module_amount ?? "")
                setTilt(scenario.tilt ?? "")
                setAzimuth(scenario.azimuth ?? "")
                setSelectedManufacturer(scenario.module?.manufacturer ?? "")
                setSelectedModel(scenario.module?.model ?? "")
            }
        }, [scenario])

    async function handleNameSubmit(e) {
        e?.preventDefault?.()

        try {
            await updateResourceField(token, `/projects/${projectId}/scenarios/${scenarioId}`, "name", scenarioName, { trim: true })
        } catch (error) {
            console.error("Error updating scenario name:", error)
        }
        console.log("Scenario name updated:", scenarioName)
    }

    async function handleScenarioFieldUpdate(field, value, options = {}) {
        try {
            await updateResourceField(token, `/projects/${projectId}/scenarios/${scenarioId}`, field, value, options)
        } catch (error) {
            console.error(`Error updating scenario ${field}:`, error)
        }
    }

    if (projLoading || scenLoading) return <p>Loading...</p>
    if (projError || scenError) return <p>Something went wrong.</p>

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
                        <BreadcrumbLink href={`/projects/${project.id}`}>{project.name}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        <BreadcrumbPage>{scenario.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex justify-between items-center">
                    <form onSubmit={handleNameSubmit}>
                        <input id="scenarioName"
                            value={scenarioName}
                            onBlur={() => handleNameSubmit()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleNameSubmit(e)
                                }
                            }}
                            onChange={(e) => setScenarioName(e.target.value)}
                        />
                    </form>
                    <Link key={project.id} to={`/projects/${project.id}`}>
                        <Button>View report</Button>    
                    </Link>
                </div>
            </header>
            <div className="main-content">
                <div className="flex gap-4">
                    <FieldGroup>
                        <h3>System configuration</h3>
                        <Field>
                            <FieldLabel htmlFor="amount">Module amount</FieldLabel>
                            <Input id="amount" type="number" value={moduleAmount}
                            onBlur={() => handleScenarioFieldUpdate("module_amount", Number(moduleAmount))}
                            onChange={(e) => setModuleAmount(e.target.value)}
                            placeholder="e.g. 100"/>
                            <FieldDescription>
                                Quantity of modules in the system
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="tilt">Tilt</FieldLabel>
                            <Input id="tilt" type="number" value={tilt} 
                            onBlur={() => handleScenarioFieldUpdate("tilt", Number(tilt))}
                            onChange={(e) => setTilt(e.target.value)} 
                            placeholder="e.g. 30" min="0" max="360"/>
                            <FieldDescription>
                                The angle towards the Sun, in degrees (between 0° and 360°)
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="azimuth">Azimuth</FieldLabel>
                            <Input id="azimuth" type="number" value={azimuth}
                            onBlur={() => handleScenarioFieldUpdate("azimuth", Number(azimuth))}
                            onChange={(e) => setAzimuth(e.target.value)}
                            placeholder="e.g. 0" min="0" max="360"/>
                            <FieldDescription>
                                Orientation relative to the South, in degrees. South orientation is 0°
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                    <div className="module w-full">
                        <FieldGroup>
                        <h3>Solar module</h3>
                        <Field>
                            <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>
                            <Combobox items={manufacturers} onValueChange={(value) => {
                                setSelectedManufacturer(value)
                                setSelectedModel("")
                            }}>
                                <ComboboxInput placeholder="Select a manufacturer" value={selectedManufacturer} />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                        {item}
                                        </ComboboxItem>
                                    )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            <FieldDescription>
                                The company that produced the solar module
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="model">Model</FieldLabel>
                            <Combobox items={modules} onValueChange={(value) => {
                                setSelectedModel(value)
                                const module = modules.find(m => m.model === value)
                                if (module) {
                                    handleScenarioFieldUpdate("module_id", module.id)
                                }
                            }}>
                                <ComboboxInput placeholder="Select a model" value={selectedModel} />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                    {selectedManufacturer && modules && modules.map((module) => (
                                        <ComboboxItem key={module.id} value={module.model}>
                                            {module.model}
                                        </ComboboxItem>
                                    ))}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            <FieldDescription>
                                The model name for the selected manufacturer
                            </FieldDescription>
                        </Field>
                        <Table>
                            <TableCaption>Selected solar module</TableCaption>
                            <TableBody>
                                <TableRow key="0">
                                    <TableCell className="font-semibold">Technology</TableCell>
                                    <TableCell>Mono c-Si</TableCell>
                                </TableRow>
                                <TableRow key="1">
                                    <TableCell className="font-semibold">Nominal power</TableCell>
                                    <TableCell>400 Wp</TableCell>
                                </TableRow>
                                <TableRow key="2">
                                    <TableCell className="font-semibold">Area</TableCell>
                                    <TableCell>1.6 m²</TableCell>
                                </TableRow>
                                <TableRow key="3">
                                    <TableCell className="font-semibold">Temperature coefficient</TableCell>
                                    <TableCell>-0.48%/°C</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                        </FieldGroup>
                    </div>
                </div>
            </div>
        </main>
    </>
   )
}