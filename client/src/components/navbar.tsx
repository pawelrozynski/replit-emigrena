import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useUser();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="text-2xl font-semibold text-primary hover:text-primary/90">
                eMigrena
              </a>
            </Link>
            <nav className="ml-10 flex items-center space-x-4">
              <Link href="/new-entry">
                <a className="text-sm text-muted-foreground hover:text-foreground">
                  Nowy wpis
                </a>
              </Link>
              <Link href="/entries">
                <a className="text-sm text-muted-foreground hover:text-foreground">
                  Historia wpisów
                </a>
              </Link>
              {user?.email === 'prozynski@kanga.exchange' && (
                <Link href="/admin">
                  <a className="text-sm text-muted-foreground hover:text-foreground">
                    Panel Admina
                  </a>
                </Link>
              )}
              <Link href="/profile">
                <a className="text-sm text-muted-foreground hover:text-foreground">
                  Profil użytkownika
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
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
  );
}