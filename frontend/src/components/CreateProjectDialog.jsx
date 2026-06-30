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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { AuthContext } from "../lib/AuthContext"
import { createProject } from "../lib/api"

export default function CreateProjectDialog() {
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [cityInput, setCityInput] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            const project = await createProject(token, { name, city_input: cityInput })
            setOpen(false)
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
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Project name</Label>
                        <Input
                            id="name"
                            placeholder="Project name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="city">Location</Label>
                        <Input
                            id="city"
                            placeholder="City"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}