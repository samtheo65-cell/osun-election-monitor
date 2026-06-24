import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: parties, error } = await supabase
    .from("political_parties")
    .select("*");

  if (error) {
    console.error("Database error:", error.message);
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Osun Election Monitor
      </h1>

      <h2 className="text-xl mb-4 text-green-700 font-semibold">
        Political Parties
      </h2>

      <ul className="space-y-2 max-w-md">
        {parties?.map((party: any) => (
          <li
            key={party.id}
            className="border p-3 rounded-lg shadow-sm bg-white flex justify-between items-center"
          >
            <span className="font-bold text-green-800">{party.abbreviation}</span>
            <span className="text-gray-600 text-sm">{party.name}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}