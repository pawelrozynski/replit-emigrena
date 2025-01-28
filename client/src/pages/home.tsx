import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      console.log('Calling API endpoint:', getApiUrl('hello'));
      const response = await fetch(getApiUrl('hello'));

      if (!response.ok) {
        const text = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: text
        });
        throw new Error(`HTTP error! status: ${response.status}\n${text}`);
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
        <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-sm overflow-auto max-w-full">
          {JSON.stringify(error, null, 2)}
        </pre>
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