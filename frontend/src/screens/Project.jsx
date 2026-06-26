import Header from "../components/Header";
import ScenarioCard from "../components/ScenarioCard";
import './screens.css'
import { Button } from "@/components/ui/button"
import { useParams } from "react-router";


export default function Project() {
    let params = useParams();
    return (
    <>
        <Header />
        <main>
            <header className="main-header">
                <h1>Your Projects / Project {params.projectId}</h1>
                <Button>New Scenario</Button>
            </header>
            <div className="main-content">
                <div className="flex flex-row gap-4">
                    <ScenarioCard />
                    <ScenarioCard />
                </div>
            </div>
        </main>
    </>
    )
}