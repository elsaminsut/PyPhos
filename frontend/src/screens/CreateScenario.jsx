import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router"

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
  TableRow,
} from "@/components/ui/table"

import { AuthContext } from "../lib/AuthContext"
import { calculateScenario, createScenario, useApi } from "../lib/api"
import { AngleSlider } from "../components/AngleSlider";

export default function CreateScenario() {
    const { projectId, scenarioId } = useParams();  
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()
    const { data: project, loading: loading, error: error } = useApi(`/api/projects/${projectId}`)
    const { data: manufacturers } = useApi("/api/modules/manufacturers")

    const [scenarioName, setScenarioName] = useState("Scenario Name")
    const [moduleAmount, setModuleAmount] = useState("")
    const [tilt, setTilt] = useState("")
    const [azimuth, setAzimuth] = useState("")
    const [selectedManufacturer, setSelectedManufacturer] = useState(null)
    const [selectedModel, setSelectedModel] = useState(null)

    const { data: modules } = useApi(
    selectedManufacturer ? `/api/modules?manufacturer=${selectedManufacturer}` : null)

    const selectedModule = modules?.find((module) => module.model === selectedModel)

    async function handleNameSubmit(e) {
        e?.preventDefault?.()

        try {
            await updateResourceField(token, `/projects/${projectId}/scenarios/${scenarioId}`, "name", scenarioName, { trim: true })
        } catch (error) {
            console.error("Error updating scenario name:", error)
        }
        console.log("Scenario name updated:", scenarioName)
    }

    async function handleSubmit(e) {
        e?.preventDefault?.()

        try {
            const scenario = await createScenario(token, {
                "name": scenarioName,
                "projectId": projectId,
                "moduleId": selectedModule.id,
                "moduleAmount": moduleAmount,
                "tilt": tilt,
                "azimuth": azimuth,
                "nominalPower": selectedModule.nominal_power
            })
            await calculateScenario(token, projectId, scenario.id)
            navigate(`/projects/${projectId}`)
        } catch (error) {
            console.error("Error updating scenario:", error)
        }
        console.log("Scenario data created:", scenarioName)
    }

        

    if (loading) return <p>Loading...</p>
    if (error) return <p>Something went wrong.</p>

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
                        <BreadcrumbLink href={`/projects/${project.id}`}>{project.name} </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        <BreadcrumbPage>New Scenario</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex justify-between items-center">
                    <form>
                        <Input id="scenarioName"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                        />
                    </form>
                    <Button onClick={handleSubmit}>Create Scenario</Button>    
                </div>
            </header>
            <div className="main-content">
                <div className="flex gap-4">
                    <FieldGroup>
                        <h3>System configuration</h3>
                        <Field>
                            <FieldLabel htmlFor="amount">Module amount</FieldLabel>
                            <Input id="amount" 
                            type="number" 
                            placeholder="e.g. 100" 
                            value={moduleAmount} 
                            onChange={(e) => setModuleAmount(e.target.value)} />
                            <FieldDescription>
                                Quantity of modules in the system
                            </FieldDescription>
                        </Field>
                        <Field>
                            <AngleSlider
                                name="Tilt"
                                min={0}
                                max={90}
                                value={Number(tilt) || 0}
                                onValueChange={(v) => setTilt(v)}
                                onValueCommitted={(v) => setTilt(v)}
                                />
                                <FieldDescription>
                                    The angle towards the Sun, in degrees (between 0° and 90°)
                                </FieldDescription>
                        </Field>
                        <Field>
                            <AngleSlider
                                name="Azimuth"
                                min={-180}
                                max={180}
                                value={Number(azimuth) || 0}
                                onValueChange={(v) => setAzimuth(v)}
                                onValueCommitted={(v) => setAzimuth(v)}
                                />
                                <FieldDescription>
                                    Orientation relative to the South, in degrees (between -180° and 180°). South is 0°, West is positive, East is negative
                                </FieldDescription>
                        </Field>
                    </FieldGroup>
                    <div className="module w-full">
                        <FieldGroup>
                        <h3>Solar module</h3>
                        <Field>
                            <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>
                            <Combobox items={manufacturers} onValueChange={setSelectedManufacturer}>
                                <ComboboxInput placeholder="Select a manufacturer" />
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
                            <Combobox items={modules} onValueChange={setSelectedModel}>
                                <ComboboxInput placeholder="Select a model" />
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
                                    <TableCell>{selectedModule? selectedModule.technology : "—"}</TableCell>
                                </TableRow>
                                <TableRow key="1">
                                    <TableCell className="font-semibold">Nominal power</TableCell>
                                    <TableCell>{selectedModule? `${selectedModule.nominal_power} Wp` : "—"}</TableCell>
                                </TableRow>
                                <TableRow key="2">
                                    <TableCell className="font-semibold">Area</TableCell>
                                    <TableCell>{selectedModule? `${selectedModule.area} m²` : "—"}</TableCell>
                                </TableRow>
                                <TableRow key="3">
                                    <TableCell className="font-semibold">Temperature coefficient</TableCell>
                                    <TableCell>{selectedModule? `${selectedModule.temp_coeff_pmax} %/°C` : "—"}</TableCell>
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