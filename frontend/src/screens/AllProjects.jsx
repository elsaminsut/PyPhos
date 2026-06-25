import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import './screens.css'
// import { Button } from "@/components/ui/button"


export default function AllProjects() {
    return (
    <body>
        <Header />
        <main>
            <header className="main-header">
                <h1>Your Projects</h1>
                {/* <Button>New Project</Button> */}
            </header>
            <div className="main-content">
                <div className="projects-list">
                    <ProjectCard />
                    <ProjectCard />
                </div>
            </div>
        </main>
    </body>
    )
}