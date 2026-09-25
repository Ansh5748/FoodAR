import { useEffect, useState } from "react"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    // Sync with the app's own theme system (localStorage + documentElement class)
    const getTheme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light"

    setTheme(getTheme())

    // Watch for theme changes via class mutations
    const observer = new MutationObserver(() => setTheme(getTheme()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
