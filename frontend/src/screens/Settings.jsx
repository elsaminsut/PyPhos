import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router"

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
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import Header from "../components/Header"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

import { AuthContext } from "../lib/AuthContext"
import { deleteUser, updateUser, useApi } from "../lib/api"
import { validateEmail, validatePassword } from "../lib/validators"

export default function Settings() {
    const { token, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const { data: user, loading, error } = useApi("/api/users/me")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [touched, setTouched] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)

    const emailCheck = validateEmail(email)
    const passwordCheck = password === "" ? { valid: true, message: null } : validatePassword(password)
    const isFormValid = emailCheck.valid && passwordCheck.valid

    useEffect(() => {
        if (user) {
            setEmail(user.email ?? "")
        }
    }, [user])

    function markTouched(field) {
        setTouched((t) => ({ ...t, [field]: true }))
    }

    async function handleSubmit(e) {
        e?.preventDefault?.()
        setSubmitError(null)
        setSubmitSuccess(false)

        if (!isFormValid) {
            setTouched({ email: true, password: true })
            return
        }

        setSubmitting(true)

        try {
            await updateUser(token, user.id, {
                email: email.trim(),
                ...(password ? { password } : {}),
            })
            setPassword("")
            setSubmitSuccess(true)
        } catch (err) {
            setSubmitError(err.detail || "Failed to update account")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete() {
        setDeleteError(null)
        setDeleting(true)

        try {
            await deleteUser(token, user.id)
            logout()
            navigate("/")
        } catch (err) {
            setDeleteError(err.detail || "Failed to delete account")
            setDeleting(false)
        }
    }

    if (loading) return <div className="grid h-screen place-items-center"><p>Loading...</p></div>
    if (error) return <div className="grid h-screen place-items-center"><p>Something went wrong.</p></div>

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
                                <BreadcrumbPage>Settings</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex justify-between items-start">
                        <h1 className="w-full max-w-xs">
                            User Settings
                        </h1>
                        <div className="flex flex-col items-end gap-1">
                            <Button onClick={handleSubmit} disabled={!isFormValid || submitting}>
                                {submitting ? "Saving..." : "Save changes"}
                            </Button>
                            {submitError && (
                                <p className="text-sm text-destructive">{submitError}</p>
                            )}
                            {submitSuccess && (
                                <p className="text-sm text-muted-foreground">Account updated.</p>
                            )}
                        </div>
                    </div>
                </header>
                <div className="main-content">
                    <div className="flex gap-4">
                        <FieldGroup>
                            <Field data-invalid={touched.email && !emailCheck.valid}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    aria-invalid={touched.email && !emailCheck.valid}
                                    onBlur={() => markTouched("email")}
                                    onChange={(e) => setEmail(e.target.value)} />
                                {touched.email && !emailCheck.valid ? (
                                    <FieldError>{emailCheck.message}</FieldError>
                                ) : (
                                    <FieldDescription>
                                        The email address used to log in
                                    </FieldDescription>
                                )}
                            </Field>
                            <Field data-invalid={touched.password && !passwordCheck.valid}>
                                <FieldLabel htmlFor="password">New password</FieldLabel>
                                <Input id="password"
                                    type="password"
                                    placeholder="Leave blank to keep your current password"
                                    value={password}
                                    aria-invalid={touched.password && !passwordCheck.valid}
                                    onBlur={() => markTouched("password")}
                                    onChange={(e) => setPassword(e.target.value)} />
                                {touched.password && !passwordCheck.valid ? (
                                    <FieldError>{passwordCheck.message}</FieldError>
                                ) : (
                                    <FieldDescription>
                                        Between 8 and 16 characters, with at least one uppercase letter, one number, and one symbol
                                    </FieldDescription>
                                )}
                            </Field>
                        </FieldGroup>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/40 p-4 mt-8">
                        <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-medium">Delete this account</p>
                            <p className="text-sm text-muted-foreground">
                                This will permanently delete your account along with all of your projects, scenarios, and reports.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger render={<Button type="button" variant="destructive" />}>
                                <Trash2 />
                                Delete
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete your account along with all of your projects, scenarios, and reports. This action cannot be undone.
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
            </main>
        </>
    )
}
