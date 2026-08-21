import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function scenarioCountLabel(count) {
  if (!count) return "No scenarios yet";
  if (count === 1) return "1 scenario";
  return `${count} scenarios`;
}

export default function ProjectCard(props) {
  return (
    <Card className="hover:bg-muted">
      <CardHeader className="flex justify-between">
        <div className="title">
          <CardTitle>{props.name}</CardTitle>
          <CardDescription>
            {props.countryCode
              ? `${props.location}, ${props.countryCode}`
              : props.location}
          </CardDescription>
        </div>
        {!props.scenarioCount ? <Badge variant="outline">Draft</Badge> : ""}
      </CardHeader>
      <CardContent>
        <p>{scenarioCountLabel(props.scenarioCount)}</p>
      </CardContent>
    </Card>
  );
}
