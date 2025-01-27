import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/hooks/use-user";

const authSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć min. 6 znaków"),
});

type AuthFields = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useUser();

  const form = useForm<AuthFields>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: AuthFields) => {
    if (isLogin) {
      login(data);
    } else {
      register(data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{isLogin ? "Logowanie" : "Rejestracja"}</CardTitle>
          <CardDescription>
            {isLogin 
              ? "Zaloguj się do swojego konta eMigrena" 
              : "Utwórz nowe konto w aplikacji eMigrena"}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        autoComplete={isLogin ? "current-password" : "new-password"} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button type="submit" className="w-full">
                {isLogin ? "Zaloguj się" : "Zarejestruj się"}
              </Button>
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin 
                  ? "Nie masz konta? Zarejestruj się" 
                  : "Masz już konto? Zaloguj się"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}