import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Header() {
  return (
    <header className="app-header">
      <h1>PyPhos</h1>
      <Avatar>
        <AvatarFallback>E</AvatarFallback>
      </Avatar>
    </header>
  )
}