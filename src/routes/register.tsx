import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { AuthForm } from "@/components/auth-form"
import { Spinner } from "@/components/spinner"
import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user) {
      void navigate({ to: "/" })
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gray-50 dark:bg-base">
        <Spinner />
      </div>
    )
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-gray-50 p-4 dark:bg-base">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Create account</CardTitle>
          <CardDescription>
            The first account becomes the administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="register" />
          <p className="pt-4 text-sm text-neutral-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-monitor dark:text-warning"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
