import { useState, useContext } from 'react'
import { useNavigate } from 'react-router'

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

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [signupError, setSignupError] = useState(null)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

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
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl font-bold">Create your account</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                        Enter your email below to create your account
                        </p>
                    </div>
                    <Field data-invalid={touched.email && !emailCheck.valid}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                        id="email"
                        type="email"
                        placeholder="me@example.com"
                        autoComplete="email"
                        value={email}
                        aria-invalid={touched.email && !emailCheck.valid}
                        onBlur={() => markTouched("email")}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                        {touched.email && !emailCheck.valid ? (
                        <FieldError>{emailCheck.message}</FieldError>
                        ) : (
                        <FieldDescription>
                        We&apos;ll use this to contact you. We will not share your
                        email with anyone else.
                        </FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <Field className="grid grid-cols-2 gap-4">
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
                            Confirm Password
                            </FieldLabel>
                            <Input id="confirm-password" type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            aria-invalid={touched.confirmPassword && !confirmCheck.valid}
                            onBlur={() => markTouched("confirmPassword")}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required />
                        </Field>
                        </Field>
                        {touched.password && !passwordCheck.valid ? (
                        <FieldError>{passwordCheck.message}</FieldError>
                        ) : touched.confirmPassword && !confirmCheck.valid ? (
                        <FieldError>{confirmCheck.message}</FieldError>
                        ) : (
                        <FieldDescription>
                        Between 8 and 16 characters, with at least one uppercase letter, one number, and one symbol
                        </FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <Button type="submit" disabled={!isFormValid || submitting}>
                        {submitting ? "Creating account..." : "Create Account"}
                        </Button>
                        {signupError && (
                        <p className="text-sm text-destructive text-center">{signupError}</p>
                        )}
                    </Field>
                    <FieldDescription className="text-center">
                        Already have an account? <a href="/login">Sign in</a>
                    </FieldDescription>
                    </FieldGroup>
                </form>
                <div className="relative hidden bg-muted md:block">
                    <img
                    src={FacadeImg}
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    />
                </div>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
      </div>
    </div>
  )
}
