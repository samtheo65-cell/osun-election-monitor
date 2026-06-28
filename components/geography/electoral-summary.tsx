export function ElectoralSummary() {
  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">
        Electoral Geography
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Senatorial District
          </p>

          <p className="mt-2 font-medium">
            —
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Federal Constituency
          </p>

          <p className="mt-2 font-medium">
            —
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            State Constituency
          </p>

          <p className="mt-2 font-medium">
            —
          </p>
        </div>
      </div>
    </section>
  );
}