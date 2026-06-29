import { ElectoralGeography } from "@/lib/types";

interface ElectoralSummaryProps {
  electoral: ElectoralGeography;
}

export function ElectoralSummary({
  electoral,
}: ElectoralSummaryProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">
        Electoral Geography
      </h3>

      <div className="space-y-4">

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Senatorial District
          </p>

          <p className="mt-2 font-medium">
            {electoral.senatorialDistrict || "—"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Federal Constituency
          </p>

          <p className="mt-2 font-medium">
            {electoral.federalConstituency || "—"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            State Constituency
          </p>

          <p className="mt-2 font-medium">
            {electoral.stateConstituency || "—"}
          </p>
        </div>

      </div>
    </section>
  );
}