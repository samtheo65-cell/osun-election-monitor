import type { PollingUnitProfileData } from "@/lib/repositories/polling-unit-profile";

interface PollingUnitProfileProps {
  profile: PollingUnitProfileData | null;
}

export function PollingUnitProfile({
  profile,
}: PollingUnitProfileProps) {
  if (!profile) {
    return (
      <section className="space-y-6">
        <h3 className="text-lg font-semibold">
          Polling Unit Profile
        </h3>

        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">
            Select a polling unit to view its profile.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">
        Polling Unit Profile
      </h3>

      <div className="rounded-lg border">
        <div className="grid gap-4 p-6 md:grid-cols-2">

          <ProfileItem label="Polling Unit" value={profile.name} />
          <ProfileItem label="Code" value={profile.code} />
          <ProfileItem label="Ward" value={profile.ward} />
          <ProfileItem label="LGA" value={profile.lga} />
          <ProfileItem label="State" value={profile.state} />
          <ProfileItem
            label="Senatorial District"
            value={profile.senatorialDistrict}
          />
          <ProfileItem
            label="Federal Constituency"
            value={profile.federalConstituency}
          />
          <ProfileItem
            label="State Constituency"
            value={profile.stateConstituency}
          />

        </div>
      </div>
    </section>
  );
}

interface ProfileItemProps {
  label: string;
  value: string;
}

function ProfileItem({
  label,
  value,
}: ProfileItemProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value || "—"}
      </p>
    </div>
  );
}