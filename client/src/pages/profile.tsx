import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user } = useUser();
  const { data: entriesCount, isLoading: isCountLoading } = useQuery<number>({
    queryKey: ['/api/entries/count'],
  });

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-semibold mb-6">Profil użytkownika</h2>
      <Card>
        <CardHeader>
          <CardTitle>Informacje o koncie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p className="mt-1">{user.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Liczba wpisów</h3>
            <p className="mt-1">
              {isCountLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                entriesCount || 0
              )}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Data rejestracji</h3>
            <p className="mt-1">
              {format(new Date(user.createdAt), "PP", { locale: pl })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
