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
  const { isGuest, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? "G"

  function logOut() {
      logout()
      navigate('/')
  }

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-background
    sticky top-0 z-50 isolate">
      <img src={Logo} alt="PyPhos Logo" className="h-8 w-auto"/>
      {!isGuest ? (
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
            <DropdownMenuItem onClick={logOut}>
              <LogOutIcon />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex gap-4 items-center">          
            <a href="/login" className="text-sm font-medium hover:text-muted-foreground transition-colors">
              Log in
            </a>
            <Button variant="outline" onClick={() => navigate('/signup')}>
              Sign up
            </Button>
        </div>
      )}
    </header>
  )
}
