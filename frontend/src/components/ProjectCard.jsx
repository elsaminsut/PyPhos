import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ProjectCard() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Project Name</CardTitle>
                <CardDescription>Location</CardDescription>
            </CardHeader>
            <CardContent>
                <p>No scenarios yet</p>
            </CardContent>
        </Card>
    )
}   