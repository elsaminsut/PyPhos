import { useState, useContext } from "react"
import { useNavigate } from "react-router"

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
import { toast } from "sonner"

import { AuthContext } from "../lib/AuthContext"
import { createProject } from "../lib/api"
import { validateName } from "../lib/validators"
import LocationCombobox from "./LocationCombobox"

export default function CreateProjectDialog() {
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [location, setLocation] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [touched, setTouched] = useState({})

    const nameCheck = validateName(name, "Project name")
    const cityCheck = { valid: location !== null, message: "Please select a city from the list" }
    const isFormValid = nameCheck.valid && cityCheck.valid

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
            const project = await createProject(token, {
                name,
                city_input: location.name,
                location: location.name,
                country_code: location.country_code,
                lat: location.lat,
                lon: location.lon,
            })
            setOpen(false)
            toast.success("Project created", { position: "top-center" })
            navigate(`/projects/${project.id}`)
        } catch (err) {
            setError(err.detail || "Failed to create project")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                New Project
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Field data-invalid={touched.name && !nameCheck.valid}>
                        <FieldLabel htmlFor="name">Project name</FieldLabel>
                        <Input
                            id="name"
                            placeholder="Project name"
                            value={name}
                            aria-invalid={touched.name && !nameCheck.valid}
                            onBlur={() => markTouched("name")}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {touched.name && !nameCheck.valid && (
                            <FieldError>{nameCheck.message}</FieldError>
                        )}
                    </Field>
                    <Field data-invalid={touched.city && !cityCheck.valid}>
                        <FieldLabel htmlFor="city">Location</FieldLabel>
                        <LocationCombobox
                            id="city"
                            value={location}
                            onSelect={setLocation}
                            ariaInvalid={touched.city && !cityCheck.valid}
                            onBlur={() => markTouched("city")}
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