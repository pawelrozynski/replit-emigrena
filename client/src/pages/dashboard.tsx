import { WellbeingForm } from "@/components/wellbeing-form";
import { EntriesList } from "@/components/entries-list";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useCms } from "@/hooks/use-cms";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useUser();
  const { getContent } = useCms();
  const welcomeText = getContent("dashboard_welcome_text") || "Witaj w aplikacji eMigrena - Twoim osobistym asystencie do monitorowania migreny i samopoczucia.";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg text-muted-foreground">
              {welcomeText}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Nowy wpis</h2>
              <WellbeingForm />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-6">Historia wpisów</h2>
            <EntriesList />
          </div>
        </div>
      </main>
    </div>
  );
}