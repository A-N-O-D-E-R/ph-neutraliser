import { AbilityBuilder, PureAbility } from "@casl/ability"
import type { AuthUser } from "../types"

type Actions = "read" | "update" | "create" | "delete" | "manage"
type Subjects = "Settings" | "User" | "Dashboard" | "Hardware" | "all"

export type AppAbility = PureAbility<[Actions, Subjects]>

export function defineAbilityFor(user: AuthUser | null): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(PureAbility)

  if (user?.role === "admin") {
    can("manage", "all")
  } else if (user?.role === "operator") {
    can("read", "Dashboard")
    can("read", "Hardware")
    can("read", "Settings")
  }

  return build()
}
