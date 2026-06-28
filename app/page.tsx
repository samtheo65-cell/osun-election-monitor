import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { GeographyWorkspace } from "@/components/geography/geography-workspace";
import { getStates } from "@/lib/repositories/states";


export default async function HomePage() {
  // Fetch states directly from the database on the server
 const states = await getStates();

  return (
    <>
      <AppHeader />

      <PageContainer>
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              Election Geography
            </h2>

            <p className="text-muted-foreground">
              Select a State, Local Government Area, Ward and Polling Unit.
            </p>
          </div>
          
<GeographyWorkspace
  states={states}
/>

        </section>
      </PageContainer>
    </>
  );
}