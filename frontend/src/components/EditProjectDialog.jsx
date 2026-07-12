import { useEffect, useState, useContext } from "react"
import { useParams } from "react-router"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Pencil } from "lucide-react"

import { AuthContext } from "../lib/AuthContext"
import { updateProject, useApi } from "../lib/api"
import { validateName } from "../lib/validators"

export default function EditProjectDialog({ onSaved }) {
    const { token } = useContext(AuthContext)
    const { projectId } = useParams();
    const { data: project, loading: projLoading, error: projError } = useApi(`/api/projects/${projectId}`)
    

    const [open, setOpen] = useState(false)
    const [projectName, setProjectName] = useState("")
    const [projectLocation, setProjectLocation] = useState("")
    const [projectCoords, setProjectCoords] = useState({ lat: null, lon: null })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [touched, setTouched] = useState({})

    const nameCheck = validateName(projectName, "Project name")
    const cityCheck = validateName(projectLocation, "Location")
    const isFormValid = nameCheck.valid && cityCheck.valid

    useEffect(() => {
        if (project) {
            setProjectName(project.name ?? "")
            setProjectLocation(project.location ?? "")
            setProjectCoords({ lat: project.lat ?? null, lon: project.lon ?? null })
        }
    }, [project])

    function markTouched(field) {
        setTouched((t) => ({ ...t, [field]: true }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        if (!isFormValid) {
            setTouched({ name: true, city: true })
            return
        }

        setSubmitting(true)

        try {
            const updated = await updateProject(token, projectId, { name: projectName.trim(), city_input: projectLocation.trim() })
            setProjectLocation(updated.location ?? "")
            setProjectCoords({ lat: updated.lat ?? null, lon: updated.lon ?? null })
            onSaved?.(updated)
            setOpen(false)
        } catch (err) {
            setError(err.detail || "Failed to update project")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="icon" variant="outline" aria-label="Edit project" />}>
                <Pencil />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Field data-invalid={touched.name && !nameCheck.valid}>
                        <FieldLabel htmlFor="name">Project name</FieldLabel>
                        <Input
                            id="name"
                            placeholder="Project name"
                            value={projectName}
                            aria-invalid={touched.name && !nameCheck.valid}
                            onBlur={() => markTouched("name")}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                        />
                        {touched.name && !nameCheck.valid && (
                            <FieldError>{nameCheck.message}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={touched.city && !cityCheck.valid}>
                        <FieldLabel htmlFor="city">Location</FieldLabel>
                        <Input
                            id="city"
                            placeholder="City"
                            value={projectLocation}
                            aria-invalid={touched.city && !cityCheck.valid}
                            onBlur={() => markTouched("city")}
                            onChange={(e) => setProjectLocation(e.target.value)}
                            required
                        />
                        {touched.city && !cityCheck.valid && (
                            <FieldError>{cityCheck.message}</FieldError>
                        )}
                    </Field>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={submitting || !isFormValid}>
                            {submitting ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}