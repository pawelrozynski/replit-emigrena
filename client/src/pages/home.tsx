import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/hello'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/hello'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-xl font-semibold text-red-500 mb-2">Błąd połączenia</h1>
        <p className="text-gray-600">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Test Netlify Functions</h1>
      <pre className="bg-gray-100 p-4 rounded-lg">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
