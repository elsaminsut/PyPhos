import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import './screens.css'
import { Button } from "@/components/ui/button"

export default function AllProjects() {
    return (
    <>
        <Header />
        <main>
            <header className="main-header">
                <h1>Your Projects</h1>
                <Button>New Project</Button>
            </header>
            <div className="main-content">
                <div className="flex flex-row gap-4">
                    <ProjectCard />
                    <ProjectCard />
                </div>
            </div>
        </main>
    </>
    )
}