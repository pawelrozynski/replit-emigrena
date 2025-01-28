import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['api/hello'],
    queryFn: async () => {
      const url = getApiUrl('hello');
      console.log('Calling API endpoint:', url);

      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const text = await response.text();
      console.log('Raw response:', text);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}\nResponse: ${text}`);
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error(`Failed to parse JSON response: ${text}`);
      }
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
        <p className="text-gray-600 mb-4">{(error as Error).message}</p>
        <pre className="p-4 bg-gray-100 rounded-lg text-sm overflow-auto max-w-full">
          {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Test API</h1>
      <pre className="bg-gray-100 p-4 rounded-lg">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}