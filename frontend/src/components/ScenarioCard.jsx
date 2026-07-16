import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ScenarioCard(props) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Scenario {props.id}</CardTitle>
                <CardDescription>{props.name}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button>View report</Button>
            </CardContent>
        </Card>
    )
}   