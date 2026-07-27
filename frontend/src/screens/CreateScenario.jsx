import { useEffect, useState } from "react";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

import { useApi } from "../lib/api"
import { useCalculateReport, useCreateScenario, useProject } from "../lib/useData"
import { validateModuleAmount, validateName } from "../lib/validators"
import { AngleSlider } from "../components/AngleSlider";

export default function CreateScenario() {
    const { projectId } = useParams();
    const navigate = useNavigate()
    const { data: project, loading: loading, error: error } = useProject(projectId)
    const { data: manufacturers } = useApi("/api/modules/manufacturers")
    const createScenario = useCreateScenario()
    const calculateReport = useCalculateReport()

    const [scenarioName, setScenarioName] = useState("Scenario Name")
    const [moduleAmount, setModuleAmount] = useState("")
    const [tilt, setTilt] = useState(0)
    const [azimuth, setAzimuth] = useState(0)
    const [selectedManufacturer, setSelectedManufacturer] = useState(null)
    const [selectedModel, setSelectedModel] = useState(null)
    const [touched, setTouched] = useState({})

    useEffect(() => {
        document.title = `Pyphos - Create scenario`
    }, [scenarioName])

    const { data: modules } = useApi(
    selectedManufacturer ? `/api/modules?manufacturer=${selectedManufacturer}` : null)

    const selectedModule = modules?.find((module) => module.model === selectedModel)

    const nameCheck = validateName(scenarioName, "Scenario name")
    const moduleAmountCheck = validateModuleAmount(moduleAmount)
    const isFormValid = nameCheck.valid && moduleAmountCheck.valid && !!selectedModule

    useEffect(() => {
        if (!modules || modules.length === 0) return

        const stillValid = modules.some((m) => m.model === selectedModel)
        if (!stillValid) {
            setSelectedModel(modules[0].model)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modules])

    function markTouched(field) {
        setTouched((t) => ({ ...t, [field]: true }))
    }

    async function handleSubmit(e) {
        e?.preventDefault?.()

        if (!isFormValid) {
            setTouched({ name: true, moduleAmount: true })
            return
        }

        try {
            const scenario = await createScenario({
                name: scenarioName,
                projectId,
                module: selectedModule,
                moduleAmount,
                tilt,
                azimuth,
            })
            await calculateReport(projectId, scenario.id)
            toast.success("Scenario created", { position: "top-center" })
            navigate(`/projects/${projectId}`)
        } catch (error) {
            console.error("Error creating scenario:", error)
        }
    }

        

    if (loading) return <p className="grid h-screen place-items-center">Loading...</p>
    if (error) return <div className="grid h-screen place-items-center"><p>Something went wrong.</p></div>

    return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="max-w-[1000px] mx-auto px-8 flex-1 flex flex-col w-full">
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
                <div className="flex justify-between items-start">
                    <form className="w-full max-w-xs">
                        <Field data-invalid={touched.name && !nameCheck.valid}>
                            <Input id="scenarioName"
                                className="text-xl md:text-xl font-semibold border-none px-0"
                                value={scenarioName}
                                aria-invalid={touched.name && !nameCheck.valid}
                                onBlur={() => markTouched("name")}
                                onChange={(e) => setScenarioName(e.target.value)}
                            />
                            {touched.name && !nameCheck.valid && (
                                <FieldError>{nameCheck.message}</FieldError>
                            )}
                        </Field>
                    </form>
                    <Button onClick={handleSubmit} disabled={!isFormValid}>Create Scenario</Button>
                </div>
            </header>
            <div className="main-content">
                <div className="flex flex-col gap-12">
                    <FieldGroup id="system">
                        <h3 className="font-semibold">System configuration</h3>
                        <Field data-invalid={touched.moduleAmount && !moduleAmountCheck.valid}>
                            <FieldLabel htmlFor="amount">Module amount</FieldLabel>
                            <Input id="amount"
                            type="number"
                            placeholder="e.g. 100"
                            value={moduleAmount}
                            aria-invalid={touched.moduleAmount && !moduleAmountCheck.valid}
                            onBlur={() => markTouched("moduleAmount")}
                            onChange={(e) => setModuleAmount(e.target.value)} />
                            {touched.moduleAmount && !moduleAmountCheck.valid ? (
                                <FieldError>{moduleAmountCheck.message}</FieldError>
                            ) : (
                                <FieldDescription>
                                    Quantity of modules in the system
                                </FieldDescription>
                            )}
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
                                tag
                                />
                                <FieldDescription>
                                    Orientation relative to the South, in degrees (between -180° and 180°). South is 0°, West is positive, East is negative
                                </FieldDescription>
                        </Field>
                    </FieldGroup>
                    <FieldGroup id="module">
                        <h3 className="font-semibold">Solar module</h3>
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
        </main>
        <Footer />
    </div>
   )
}