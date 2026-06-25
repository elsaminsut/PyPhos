import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import './screens.css'
// import { Button } from "@/components/ui/button"
import { useParams } from "react-router";


export default function Project() {
    let params = useParams();
    return (
    <body>
        <Header />
        <main>
            <header className="main-header">
                <h1>Project {params.projectId}</h1>
                {/* <Button>New Scenario</Button> */}
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