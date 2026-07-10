import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Logo from "../assets/pyphos-logo.svg"

export default function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-background
    sticky top-0 z-50 isolate">
      <img src={Logo} alt="PyPhos Logo" className="h-8 w-auto"/>
      <Avatar>
        <AvatarFallback>E</AvatarFallback>
      </Avatar>
    </header>
  )
}