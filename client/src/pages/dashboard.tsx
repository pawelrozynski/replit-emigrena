import { WellbeingForm } from "@/components/wellbeing-form";
import { EntriesList } from "@/components/entries-list";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">eMigrena</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Zalogowano jako {user?.username}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Wyloguj
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Nowy wpis</h2>
              <WellbeingForm />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Historia</h2>
            <EntriesList />
          </div>
        </div>
      </main>
    </div>
  );
}
