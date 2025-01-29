import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          const res = await fetch(queryKey[0] as string, {
            credentials: "include",
            headers: {
              "Accept": "application/json",
              "Cache-Control": process.env.NODE_ENV === "production" ? "no-cache" : "default",
            },
          });

          if (!res.ok) {
            // In production, don't expose detailed error messages
            if (process.env.NODE_ENV === "production") {
              throw new Error("Wystąpił błąd podczas komunikacji z serwerem.");
            }

            if (res.status >= 500) {
              throw new Error(`${res.status}: ${res.statusText}`);
            }

            throw new Error(`${res.status}: ${await res.text()}`);
          }

          return res.json();
        } catch (error) {
          // In production, log the error but don't expose it
          console.error(error);
          throw new Error(
            process.env.NODE_ENV === "production"
              ? "Wystąpił błąd podczas komunikacji z serwerem."
              : (error as Error).message
          );
        }
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: process.env.NODE_ENV === "production" ? 5 * 60 * 1000 : Infinity, // 5 minutes in production
      retry: process.env.NODE_ENV === "production" ? 2 : false, // Retry failed requests in production
    },
    mutations: {
      retry: false,
    }
  },
});