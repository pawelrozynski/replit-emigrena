import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/hooks/use-user";
import { useCms } from "@/hooks/use-cms";
import { Loader2 } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać przynajmniej jedną wielką literę")
    .regex(/[0-9]/, "Hasło musi zawierać przynajmniej jedną cyfrę"),
  confirmPassword: z.string(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

type AuthFields = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading } = useUser();
  const [location] = useLocation();
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { getContent } = useCms();

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    if (params.get('verified') === 'true') {
      setVerificationSuccess(true);
    }
  }, [location]);

  const form = useForm<AuthFields>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: AuthFields) => {
    if (isLogin) {
      await login({ email: data.email, password: data.password });
    } else {
      await register({ email: data.email, password: data.password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        {verificationSuccess && (
          <Alert className="mb-4">
            <AlertDescription>
              Email został pomyślnie zweryfikowany. Możesz się teraz zalogować.
            </AlertDescription>
          </Alert>
        )}
        <CardHeader>
          <CardTitle>{isLogin ? "Logowanie" : "Rejestracja"}</CardTitle>
          <CardDescription>
            {isLogin 
              ? getContent("login_instructions") 
              : getContent("registration_instructions")}
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
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potwierdź hasło</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          autoComplete="new-password" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? "Zaloguj się" : "Zarejestruj się"}
              </Button>
              <Button 
                type="button" 
                variant="link" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  form.reset();
                }}
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