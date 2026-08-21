import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useProject, useUpdateProject, useDeleteProject } from "../lib/useData";
import { validateName, validateRequired } from "../lib/validators";
import LocationCombobox from "./LocationCombobox";

export default function EditProjectDialog({ onSaved }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: project } = useProject(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationChanged, setLocationChanged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [loadedProjectId, setLoadedProjectId] = useState(null);

  const nameCheck = validateName(projectName, "Project name");
  const locationCheck = validateRequired(locationQuery, "Location");
  const isFormValid = nameCheck.valid && locationCheck.valid;

  if (project && project.id !== loadedProjectId) {
    setLoadedProjectId(project.id);
    setProjectName(project.name ?? "");
    setLocation({
      name: project.location,
      country_code: project.country_code,
      admin1: null,
      lat: project.lat,
      lon: project.lon,
    });
    setLocationQuery(project.location ?? "");
    setLocationChanged(false);
  }

  function markTouched(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleLocationSelect(candidate) {
    setLocation(candidate);
    setLocationChanged(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setTouched({ name: true, city: true });
      return;
    }

    setSubmitting(true);

    try {
      const updates = { name: projectName.trim() };
      if (locationChanged) {
        updates.city_input = location.name;
        updates.location = location.name;
        updates.country_code = location.country_code;
        updates.lat = location.lat;
        updates.lon = location.lon;
      }

      const updated = await updateProject(projectId, updates);
      setLocation({
        name: updated.location,
        country_code: updated.country_code,
        admin1: null,
        lat: updated.lat,
        lon: updated.lon,
      });
      setLocationChanged(false);
      onSaved?.(updated);
      setOpen(false);
      toast.success("Project updated", { position: "top-center" });
    } catch (err) {
      setError(err.detail || "Failed to update project");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    setDeleting(true);

    try {
      await deleteProject(projectId);
      toast.info("Project deleted", { position: "top-center" });
      navigate("/projects");
    } catch (err) {
      setDeleteError(err.detail || "Failed to delete project");
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" aria-label="Edit project">
            Edit project
          </Button>
        }
      ></DialogTrigger>
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
          <Field data-invalid={touched.city && !locationCheck.valid}>
            <FieldLabel htmlFor="city">Location</FieldLabel>
            <LocationCombobox
              id="city"
              value={location}
              onSelect={handleLocationSelect}
              onInputChange={setLocationQuery}
              ariaInvalid={touched.city && !locationCheck.valid}
              onBlur={() => markTouched("city")}
            />
            {touched.city && !locationCheck.valid && (
              <FieldError>{locationCheck.message}</FieldError>
            )}
          </Field>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <Accordion className="rounded-lg border border-destructive/40 p-4">
            <AccordionItem value="delete">
              <AccordionTrigger className="hover:no-underline">
                Delete this project
              </AccordionTrigger>
              <AccordionContent className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  This will permanently delete this project along with all of
                  its scenarios and reports. This action cannot be undone.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !isFormValid}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
