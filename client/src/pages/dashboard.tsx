import { useUser } from "@/hooks/use-user";
import { useCms } from "@/hooks/use-cms";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useUser();
  const { getContent } = useCms();
  const welcomeText = getContent("dashboard_welcome_text") || "Witaj w aplikacji eMigrena - Twoim osobistym asystencie do monitorowania migreny i samopoczucia.";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-lg text-muted-foreground">
              {welcomeText}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}