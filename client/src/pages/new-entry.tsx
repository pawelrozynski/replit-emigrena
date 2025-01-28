import { WellbeingForm } from "@/components/wellbeing-form";

export default function NewEntry() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-semibold mb-6">Nowy wpis</h2>
      <WellbeingForm />
    </div>
  );
}
