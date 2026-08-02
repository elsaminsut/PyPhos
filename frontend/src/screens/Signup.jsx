import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, InfoIcon } from 'lucide-react'

import { AuthContext } from '@/lib/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { validateEmail, validatePassword } from "@/lib/validators"

import FacadeImg from "../assets/martin-woortman-NzW5ytrqi34-unsplash.jpg"
import LandingBackground from "../assets/landing-background.png"
import Logo from "../assets/pyphos-logo.svg"

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [signupError, setSignupError] = useState(null)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `Welcome to Pyphos! - Sign up`
  }, [])

  const emailCheck = validateEmail(email)
  const passwordCheck = validatePassword(password)
  const confirmCheck = confirmPassword !== password
    ? { valid: false, message: "Passwords do not match" }
    : { valid: true, message: null }
  const isFormValid = emailCheck.valid && passwordCheck.valid && confirmCheck.valid

  function markTouched(field) {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSignupError(null)

    if (!isFormValid) {
      setTouched({ email: true, password: true, confirmPassword: true })
      return
    }

    setSubmitting(true)

    try {
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        setSignupError(registerData.detail || "Failed to create account")
        return
      }

      // Account created — log straight in with the same credentials
      const loginResponse = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password })
      })
      const loginData = await loginResponse.json()

      if (loginResponse.ok) {
        login(loginData.access_token)
        navigate('/projects')
      } else {
        navigate('/login')
      }
    } catch (error) {
      console.error('Error creating account:', error)
      setSignupError("Failed to create account. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="font-instrument-sans flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
      style={{
        backgroundImage: `url(${LandingBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
      </Link>
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden rounded-2xl p-0 shadow-lg">
                <CardContent className="grid p-0 md:grid-cols-2">
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <img src={Logo} alt="PyPhos Logo" className="mb-10 h-6 w-auto" />
                    <FieldGroup>
                    <h1 className="font-instrument-serif text-4xl font-normal">Create your account</h1>
                    <Field data-invalid={touched.email && !emailCheck.valid}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                        id="email"
                        type="email"
                        placeholder="me@example.io"
                        autoComplete="email"
                        value={email}
                        aria-invalid={touched.email && !emailCheck.valid}
                        onBlur={() => markTouched("email")}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                        {touched.email && !emailCheck.valid ? (
                        <FieldError>{emailCheck.message}</FieldError>
                        ) : "" }
                    </Field>
                    <Field>
                        <Field data-invalid={touched.password && !passwordCheck.valid}>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input id="password" type="password"
                            autoComplete="new-password"
                            value={password}
                            aria-invalid={touched.password && !passwordCheck.valid}
                            onBlur={() => markTouched("password")}
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                        </Field>
                        <Field data-invalid={touched.confirmPassword && !confirmCheck.valid}>
                            <FieldLabel htmlFor="confirm-password">
                            Repeat password
                            </FieldLabel>
                            <Input id="confirm-password" type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            aria-invalid={touched.confirmPassword && !confirmCheck.valid}
                            onBlur={() => markTouched("confirmPassword")}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required />
                        </Field>
                        {touched.password && !passwordCheck.valid ? (
                        <FieldError>{passwordCheck.message}</FieldError>
                        ) : touched.confirmPassword && !confirmCheck.valid ? (
                        <FieldError>{confirmCheck.message}</FieldError>
                        ) : (
                        <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                            <p>Between 8 and 16 characters, with at least one uppercase letter, one number, and one symbol</p>
                        </div>
                        )}
                    </Field>
                    <Field>
                        <Button
                        type="submit"
                        disabled={!isFormValid || submitting}
                        className="h-10 rounded-full bg-foreground text-background hover:bg-foreground/80"
                        >
                        {submitting ? "Creating account..." : "Create account"}
                        </Button>
                        {signupError && (
                        <p className="text-sm text-destructive text-center">{signupError}</p>
                        )}
                    </Field>
                    <FieldDescription className="text-center">
                        Already have an account?{" "}
                        <a href="/login" className="text-foreground underline underline-offset-2">Sign in</a>
                    </FieldDescription>
                    </FieldGroup>
                </form>
                <div className="relative hidden md:block">
                    <img
                    src={FacadeImg}
                    alt="Image"
                    className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-xl object-cover dark:brightness-[0.2] dark:grayscale"
                    />
                </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
