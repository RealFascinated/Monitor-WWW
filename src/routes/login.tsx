import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { LoadingState } from "@/components/loading-state"
import { AuthForm } from "@/components/auth-form"
import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { pageTitle } from "@/lib/page-title"

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: pageTitle("Sign in") }],
  }),
  component: LoginPage,
})

function LoginPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user) {
      void navigate({ to: "/" })
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return <LoadingState message="Checking session…" centered />
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-background px-6 py-8">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Sign in to manage your monitored servers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" />
          <p className="pt-4 text-sm text-muted-foreground">
            No account?{" "}
            <Link
              to="/register"
              className="font-medium text-monitor dark:text-warning"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
