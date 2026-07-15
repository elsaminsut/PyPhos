import { AuthContext } from '@/lib/AuthContext'
import { useContext } from "react"
import { useNavigate } from 'react-router'

import {
  SettingsIcon,
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Logo from "../assets/pyphos-logo.svg"

export default function Header() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? ""

  function logOut() {
      logout()
      navigate('/')
  }

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-background
    sticky top-0 z-50 isolate">
      <img src={Logo} alt="PyPhos Logo" className="h-8 w-auto"/>
      <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full"><Avatar>
          <AvatarFallback>{avatarLetter}</AvatarFallback>
        </Avatar></Button>} />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOutIcon />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </header>
  )
}
