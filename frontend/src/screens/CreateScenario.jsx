import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router"

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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import Header from "../components/Header";
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { AuthContext } from "../lib/AuthContext"
import { useApi } from "../lib/api"

export default function CreateScenario() {
    const { projectId, scenarioId } = useParams();  
    const { token } = useContext(AuthContext)
    const { data: project, loading: loading, error: error } = useApi(`/api/projects/${projectId}`)

    if (loading) return <p>Loading...</p>
    if (error) return <p>Something went wrong.</p>

    return (
    <>
        <Header />
        <main className="p-8">
            <header className="flex-col mb-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                        <BreadcrumbLink href="/projects/">Your projects</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        <BreadcrumbLink href={`/projects/${project.id}/`}>{project.name} </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        <BreadcrumbPage>New Scenario</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex justify-between items-center">
                    <form>
                        <input id="projectName"
                            value="Scenario Name"
                            // onChange={(e) => setProjectName(e.target.value)}
                        />
                    </form>
                    <Link key={project.id} to={`/projects/${project.id}`}>
                        <Button >Create Scenario</Button>    
                    </Link>
                </div>
            </header>
            <div className="main-content">
                <div className="flex gap-4">
                    <FieldGroup>
                        <h3>System configuration</h3>
                        {/* <form>
                            <label htmlFor="amount">Module amount</label>
                            <input id="amount"
                                value="aAaaa"
                                // onChange={(e) => setProjectLocation(e.target.value)}
                            />
                        </form> */}

                        <Field>
                            <FieldLabel htmlFor="amount">Module amount</FieldLabel>
                            <Input id="amount" type="number" placeholder="e.g. 30" />
                            <FieldDescription>
                                Quantity of modules in the system
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="tilt">Tilt</FieldLabel>
                            <Input id="tilt" type="number" placeholder="e.g. 30" min="0" max="360"/>
                            <FieldDescription>
                                The angle towards the Sun, in degrees (between 0° and 360°)
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="orientation">Orientation</FieldLabel>
                            <Input id="orientation" type="number" placeholder="e.g. 0" min="0" max="360"/>
                            <FieldDescription>
                                The angle relative to the South, in degrees. South orientation is 0°
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                    <div className="module w-full">
                        <FieldGroup>
                        <h3>Solar module</h3>
                        <Field>
                            <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>
                            <Input id="manufacturer" type="text" placeholder="e.g. 30"/>
                            <FieldDescription>
                                The company that produced the solar module
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="model">Model</FieldLabel>
                            <Input id="model" type="text" placeholder="e.g. 0"/>
                            <FieldDescription>
                                The model name of the solar module
                            </FieldDescription>
                        </Field>
                        <Table>
                            <TableCaption>Selected solar module</TableCaption>
                            {/* <TableHeader>
                                <TableRow>
                                <TableHead className="text-right">Technology</TableHead>
                                <TableHead className="text-left">Nominal power</TableHead>
                                </TableRow>
                            </TableHeader> */}
                            <TableBody>
                                <TableRow key="0">
                                    <TableCell className="font-semibold">Technology</TableCell>
                                    <TableCell>Mono c-Si</TableCell>
                                </TableRow>
                                <TableRow key="1">
                                    <TableCell className="font-semibold">Nominal power</TableCell>
                                    <TableCell>400 Wp</TableCell>
                                </TableRow>
                                <TableRow key="2">
                                    <TableCell className="font-semibold">Area</TableCell>
                                    <TableCell>1.6 m²</TableCell>
                                </TableRow>
                                <TableRow key="3">
                                    <TableCell className="font-semibold">Temperature coefficient</TableCell>
                                    <TableCell>-0.48%/°C</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                        </FieldGroup>
                    </div>
                </div>
            </div>
        </main>
    </>
   )
}