import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { ArrowRight } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuthContext } from "../lib/auth-context"

import Elsa from "../assets/avatar-elsa.jpg"
import Logo from "../assets/pyphos-logo.svg"
import LandingBackground from "../assets/landing-background.png"

export default function Landing() {
  const [showAbout, setShowAbout] = useState(false)
  const [buttonHovered, setButtonHovered] = useState(false)
  const navigate = useNavigate()
  const cursorRef = useRef(null)
  const { continueAsGuest } = useContext(AuthContext)

  useEffect(() => {
    function handleMouseMove(e) {
      if (!cursorRef.current) return
      cursorRef.current.style.left = `${e.clientX}px`
      cursorRef.current.style.top = `${e.clientY}px`
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (!showAbout) return

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setShowAbout(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showAbout])

  function handleClick() {
    continueAsGuest()
    navigate("/projects")
  }

  return (
    <div
      className="relative min-h-screen cursor-none overflow-hidden bg-white"
      style={{
        backgroundImage: `url(${LandingBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        ref={cursorRef}
        className={cn(
          "pointer-events-none fixed top-0 left-0 z-100 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFCC00] transition-[width,height] duration-200 ease-out",
          buttonHovered ? "size-16" : "size-6"
        )}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col items-center transition-[filter] duration-300",
          showAbout && "pointer-events-none blur-md select-none"
        )}
      >
        <header className="pt-10">
          <img src={Logo} alt="PyPhos" className="h-6 w-auto" />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <h1 className="font-instrument-serif text-[60px] leading-none text-balance">
            Know
            <br />
            <span className="italic">your solar output</span>
            <br />
            before you install
          </h1>

          <p className="font-instrument-sans mt-8 max-w-sm text-sm text-muted-foreground text-balance">
            PyPhos calculates the real-world performance of any solar installation at your exact location.
          </p>
          <p className="font-instrument-sans mt-1 text-sm font-medium text-foreground">
            Pick a module. Set your site. Get the numbers
          </p>

          <Button
            size="lg"
            className="mt-8 h-11 cursor-none rounded-full bg-foreground px-6 text-base text-background hover:-translate-y-0.5 hover:bg-foreground/70"
            onClick={handleClick}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
          >
            Run a calculation
            <ArrowRight />
          </Button>
        </main>

        <footer className="pb-10">
          <button
            onClick={() => setShowAbout(true)}
            className="font-instrument-sans cursor-none text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            About
          </button>
        </footer>
      </div>

      {showAbout && (
        <div
          className="absolute inset-0 z-50 flex items-center"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="max-w-xs px-10 sm:px-16"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Avatar className="mb-3" size="lg">
              <AvatarImage src={Elsa} />
              <AvatarFallback>E</AvatarFallback>
            </Avatar>
            <p className="font-instrument-sans text-sm font-semibold text-foreground">
              PyPhos is built in the open by{" "}
              <a
                href="https://elsaminsut.com"
                target="_blank"
                rel="noreferrer"
                className="text-foreground cursor-none hover:underline underline-offset-2"
              >
              Elsa Minsut 
              </a>
              {" "}and always improving.
            </p>
            <p className="font-instrument-sans mt-3 text-sm text-muted-foreground">
              To follow updates and new features, keep an eye on the{" "}
              <a
                href="https://github.com/elsaminsut/pyphos"
                target="_blank"
                rel="noreferrer"
                className="text-foreground cursor-none hover:underline underline-offset-2"
              >
                GitHub repo
              </a>
              .
            </p>
            <button
              onClick={() => setShowAbout(false)}
              className="font-instrument-sans mt-6 cursor-none text-sm text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
