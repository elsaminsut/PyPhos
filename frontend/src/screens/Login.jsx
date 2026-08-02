import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'

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
import { validateEmail, validateLoginPassword } from "@/lib/validators"

import FacadeImg from "../assets/martin-woortman-NzW5ytrqi34-unsplash.jpg"
import LandingBackground from "../assets/landing-background.png"
import Logo from "../assets/pyphos-logo.svg"

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [loginError, setLoginError] = useState(null)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `Welcome to Pyphos! - Log in`
  }, [])

  const emailCheck = validateEmail(email)
  const passwordCheck = validateLoginPassword(password)
  const isFormValid = emailCheck.valid && passwordCheck.valid

  function markTouched(field) {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginError(null)

    if (!isFormValid) {
      setTouched({ email: true, password: true })
      return
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ username: email, password })
      })

      const data = await response.json()

      if (response.ok) {
        login(data.access_token)
        navigate('/projects')
      } else {
        setLoginError(data.detail || "Failed to log in")
      }
    } catch (error) {
      console.error('Error logging in:', error)
      setLoginError("Failed to log in. Please try again.")
    }
  };

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
                      <h1 className="font-instrument-serif text-4xl font-normal">Welcome back!</h1>
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
                        {touched.email && !emailCheck.valid && (
                          <FieldError>{emailCheck.message}</FieldError>
                        )}
                      </Field>
                      <Field data-invalid={touched.password && !passwordCheck.valid}>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          aria-invalid={touched.password && !passwordCheck.valid}
                          onBlur={() => markTouched("password")}
                          onChange={(e) => setPassword(e.target.value)}
                          required />
                        {touched.password && !passwordCheck.valid && (
                          <FieldError>{passwordCheck.message}</FieldError>
                        )}
                      </Field>
                      <Field>
                        <Button
                          type="submit"
                          disabled={!isFormValid}
                          className="h-10 rounded-full bg-foreground text-background hover:bg-foreground/80"
                        >
                          Log in
                        </Button>
                        {loginError && (
                          <p className="text-sm text-destructive text-center">{loginError}</p>
                        )}
                      </Field>
                      <FieldDescription className="text-center">
                        Don&apos;t have an account?{" "}
                        <a href="/signup" className="text-foreground underline underline-offset-2">Sign up</a>
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
              <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
              </FieldDescription>
            </div>
      </div>
    </div>
  )
}

export default LoginPage
