import { Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { SectionHeader, ToggleGroup } from "./Section";
import { Theme } from "@/hooks/use-theme";

export default function AppearanceSection({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <Card>
      <SectionHeader
        icon={<Sun className="h-5 w-5" />}
        title="Appearance"
        description="Choose how the interface looks"
      />
      <CardContent className="pt-6">
        <ToggleGroup
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
            { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
            { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
          ]}
        />
      </CardContent>
    </Card>
  )
}