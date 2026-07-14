import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function scenarioCountLabel(count) {
    if (!count) return "No scenarios yet"
    if (count === 1) return "1 scenario"
    return `${count} scenarios`
}

export default function ProjectCard(props) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{props.name}</CardTitle>
                <CardDescription>{props.location}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{scenarioCountLabel(props.scenarioCount)}</p>
            </CardContent>
        </Card>
    )
}