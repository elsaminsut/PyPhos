import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import Footer from "../components/Footer"
import Header from "../components/Header";
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useApi } from "../lib/api"
import { useCalculateReport, useDeleteScenario, useUpdateScenario, useProject, useScenario } from "../lib/useData"
import { validateModuleAmount, validateName } from "../lib/validators"
import { AngleSlider } from "../components/AngleSlider";

export default function Scenario() {
    const { projectId, scenarioId } = useParams();
    const navigate = useNavigate()
    const { data: project, loading: projLoading, error: projError } = useProject(projectId)
    const { data: scenario, loading: scenLoading, error: scenError } = useScenario(projectId, scenarioId, project?.is_demo)
    const { data: manufacturers } = useApi("/api/modules/manufacturers")
    const updateScenario = useUpdateScenario()
    const deleteScenario = useDeleteScenario()
    const calculateReport = useCalculateReport()
    
    const [scenarioName, setScenarioName] = useState("")
    const [moduleAmount, setModuleAmount] = useState("")
    const [tilt, setTilt] = useState("")
    const [azimuth, setAzimuth] = useState("")
    const [selectedManufacturer, setSelectedManufacturer] = useState("")
    const [selectedModel, setSelectedModel] = useState("")
    const [touched, setTouched] = useState({})

    useEffect(() => {
        document.title = `Pyphos - Edit scenario: ${scenarioName || "Scenario"}`
    }, [scenarioName])

    const { data: modules } = useApi(
        selectedManufacturer ? `/api/modules?manufacturer=${selectedManufacturer}` : null)

    const selectedModule = modules?.find((module) => module.model === selectedModel)

    const nameCheck = validateName(scenarioName, "Scenario name")
    const moduleAmountCheck = validateModuleAmount(moduleAmount)
    const isFormValid = nameCheck.valid && moduleAmountCheck.valid

    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)
    const [loadedScenarioId, setLoadedScenarioId] = useState(null) // avoid useEffect for resetting form fields when a new scenario loads

    function markTouched(field) {
        setTouched((t) => ({ ...t, [field]: true }))
    }

    if (scenario && scenario.id !== loadedScenarioId) {
        setLoadedScenarioId(scenario.id)
        setScenarioName(scenario.name ?? "")
        setModuleAmount(scenario.module_amount ?? "")
        setTilt(scenario.tilt ?? "")
        setAzimuth(scenario.azimuth ?? "")
        setSelectedManufacturer(scenario.module?.manufacturer ?? "")
        setSelectedModel(scenario.module?.model ?? "")
    }

    if (modules && modules.length > 0 && !modules.some((m) => m.model === selectedModel)) {
        setSelectedModel(modules[0].model)
    }

    async function handleNameSubmit(e) {
        e?.preventDefault?.()
        markTouched("name")

        if (!validateName(scenarioName, "Scenario name").valid) return

        try {
            await updateScenario(projectId, scenarioId, { name: scenarioName.trim() })
            toast.success("Project name updated", { position: "top-center" })

        } catch (error) {
            console.error("Error updating scenario name:", error)
        }
    }

    async function handleSubmit(e) {
        e?.preventDefault?.()

        if (!isFormValid) {
            setTouched({ name: true, moduleAmount: true })
            return
        }

        try {
            const module = modules?.find((m) => m.model === selectedModel)

            await updateScenario(projectId, scenario.id, {
                name: scenarioName.trim(),
                module_amount: Number(moduleAmount),
                tilt: Number(tilt),
                azimuth: Number(azimuth),
                ...(module ? { module_id: module.id } : {}),
            })
            await calculateReport(projectId, scenario.id)
            toast.success("Scenario updated", { position: "top-center" })
            navigate(`/projects/${projectId}`, { state: { selectedScenarioId: scenario.id } })
        } catch (error) {
            console.error("Error saving scenario:", error)
        }
    }

    async function handleDelete() {
        setDeleteError(null)
        setDeleting(true)

        try {
            await deleteScenario(projectId, scenarioId)
            toast.info("Scenario deleted", { position: "top-center" })
            navigate(`/projects/${projectId}`)
        } catch (err) {
            setDeleteError(err.detail || "Failed to delete project")
            setDeleting(false)
        }
    }
    
    if (projLoading || scenLoading) return <p className="grid h-screen place-items-center">Loading...</p>
    if (projError || scenError) return <div className="grid h-screen place-items-center"><p>Something went wrong.</p></div>

    return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="page-container flex-1 flex flex-col w-full">
            <header className="flex-col mb-8">
                <Breadcrumb className="my-4">
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
                <div className="flex justify-between items-start">
                    <form onSubmit={handleNameSubmit} className="w-full max-w-xs">
                        <Field data-invalid={touched.name && !nameCheck.valid}>
                            <Input id="scenarioName"
                                className="text-xl md:text-xl font-semibold border-none px-0"
                                value={scenarioName}
                                aria-invalid={touched.name && !nameCheck.valid}
                                onBlur={() => handleNameSubmit()}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleNameSubmit(e)
                                    }
                                }}
                                onChange={(e) => setScenarioName(e.target.value)}
                            />
                            {touched.name && !nameCheck.valid && (
                                <FieldError>{nameCheck.message}</FieldError>
                            )}
                        </Field>
                    </form>
                    <Button onClick={handleSubmit} disabled={!isFormValid}>Save scenario</Button>
                </div>
            </header>
            <div className="main-content">
                <div className="flex flex-col gap-12">
                    <FieldGroup id="system">
                        <h3 className="font-semibold">System configuration</h3>
                        <Field data-invalid={touched.moduleAmount && !moduleAmountCheck.valid}>
                            <FieldLabel htmlFor="amount">Module amount</FieldLabel>
                            <Input id="amount" type="number" value={moduleAmount}
                            aria-invalid={touched.moduleAmount && !moduleAmountCheck.valid}
                            onChange={(e) => setModuleAmount(e.target.value)}
                            placeholder="e.g. 100"/>
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
                            <Combobox items={manufacturers} value={selectedManufacturer} onValueChange={(value) => {
                                setSelectedManufacturer(value)
                                setSelectedModel("")
                            }}>
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
                                The company that produces the solar module
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="model">Model</FieldLabel>
                            <Combobox items={modules} value={selectedModel} onValueChange={(value) => {
                                setSelectedModel(value)
                            }}>
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
                                    <TableCell>{selectedModule ? selectedModule.technology : "—"}</TableCell>
                                </TableRow>
                                <TableRow key="1">
                                    <TableCell className="font-semibold">Nominal power</TableCell>
                                    <TableCell>{selectedModule ? `${selectedModule.nominal_power} Wp` : "—"}</TableCell>
                                </TableRow>
                                <TableRow key="2">
                                    <TableCell className="font-semibold">Area</TableCell>
                                    <TableCell>{selectedModule ? `${selectedModule.area} m²` : "—"}</TableCell>
                                </TableRow>
                                <TableRow key="3">
                                    <TableCell className="font-semibold">Temperature coefficient</TableCell>
                                    <TableCell>{selectedModule ? `${selectedModule.temp_coeff_pmax}%/°C` : "—"}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </FieldGroup>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/40 p-4">
                        <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-medium">Delete this scenario</p>
                            <p className="text-sm text-muted-foreground">
                                This will permanently delete this scenario along with all of its reports.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger render={<Button type="button" variant="destructive" />}>
                                <Trash2 />
                                Delete
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete "{scenarioName}"?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete this scenario along with all of its reports. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        {deleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
   )
}