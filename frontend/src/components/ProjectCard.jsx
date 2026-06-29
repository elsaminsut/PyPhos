import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ProjectCard(props) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{props.name}</CardTitle>
                <CardDescription>{props.location}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>No scenarios yet</p>
            </CardContent>
        </Card>
    )
}   