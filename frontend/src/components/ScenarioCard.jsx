import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ScenarioCard() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Scenario 1</CardTitle>
                <CardDescription>10 modules South</CardDescription>
            </CardHeader>
            <CardContent>
                <Button>View report</Button>
            </CardContent>
        </Card>
    )
}   