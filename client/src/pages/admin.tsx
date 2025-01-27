import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CmsEditor } from "@/components/cms-editor";
import { DocumentationEditor } from "@/components/documentation-editor";

export default function AdminPage() {
  const { user } = useUser();
  const [, navigate] = useLocation();

  // Redirect non-admin users
  if (user && !user.isAdmin) {
    navigate("/");
    return null;
  }

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-semibold text-primary">Panel Admina</h1>
            <nav className="flex space-x-4">
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Powrót do aplikacji
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Zarządzanie treścią</CardTitle>
            <CardDescription>
              Zarządzaj treściami statycznymi i dokumentacją aplikacji
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cms">
              <TabsList className="mb-4">
                <TabsTrigger value="cms">Treści CMS</TabsTrigger>
                <TabsTrigger value="documentation">Dokumentacja</TabsTrigger>
              </TabsList>
              <TabsContent value="cms">
                <CmsEditor />
              </TabsContent>
              <TabsContent value="documentation">
                <DocumentationEditor />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}