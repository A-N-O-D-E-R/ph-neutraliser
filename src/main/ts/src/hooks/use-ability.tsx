import { defineAbilityFor } from "../lib/ability"
import { useSessionStore } from "../store/userStore"

export function useAbility() {
  const { user } = useSessionStore()
  return defineAbilityFor(user)
}
