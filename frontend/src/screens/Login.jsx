import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router'

import { AuthContext } from '@/lib/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { LoginForm } from "@/components/login-form"

import FacadeImg from "../assets/martin-woortman-NzW5ytrqi34-unsplash.jpg"
import '../index.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ username: email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        login(data.access_token)
        navigate('/projects')
      } else {
        alert(data.detail)
      }
    } catch (error) {
      console.error('Error logging in:', error)
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
              <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                  <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <FieldGroup>
                      <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl font-bold">Welcome back</h1>
                        <p className="text-balance text-muted-foreground">
                          Login to your PyPhos account
                        </p>
                      </div>
                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </Field>
                      <Field>
                        <div className="flex items-center">
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          {/* <a
                            href="#"
                            className="ml-auto text-sm underline-offset-2 hover:underline"
                          >
                            Forgot your password?
                          </a> */}
                        </div>
                        <Input 
                          id="password" 
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}                          
                          required />
                      </Field>
                      <Field>
                        <Button type="submit">Login</Button>
                      </Field>
                      <FieldDescription className="text-center">
                        Don&apos;t have an account? <a href="#">Sign up</a>
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

export default LoginPage
