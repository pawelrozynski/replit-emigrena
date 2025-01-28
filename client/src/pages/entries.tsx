import { EntriesList } from "@/components/entries-list";

export default function Entries() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-semibold mb-6">Historia wpisów</h2>
      <EntriesList />
    </div>
  );
}
