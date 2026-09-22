import { PromoForm, PromoRowActions } from "@/components/admin/promo-form";
import { Empty, Flag, PageHeader, Panel, dateTime } from "@/components/admin/ui";
import * as api from "@/lib/admin/api";
import { adminData, adminTitle, requireAdmin } from "@/lib/admin/dal";
import type { AdminPromo } from "@/lib/admin/types";
import { money } from "@/lib/shop/format";

export const generateMetadata = adminTitle("Promos");

function describe(promo: AdminPromo): string {
  const off =
    promo.kind === "percent"
      ? `${Math.round(promo.value * 10000) / 100}% off`
      : promo.kind === "amount"
        ? `${money(promo.value)} off`
        : "Free shipping";
  return promo.minimumCents ? `${off} over ${money(promo.minimumCents)}` : off;
}

export default async function PromosPage({ params }: PageProps<"/[admin]/promos">) {
  const context = await requireAdmin((await params).admin);
  const promos = await adminData(context, api.promos);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Promos"
        title="Promo codes"
        lede="Codes customers type at checkout. The discount is always recomputed on the server, so a code can be switched off at any moment and takes effect on the next order."
      />

      <Panel title="New promo">
        <PromoForm />
      </Panel>

      {promos.length === 0 ? (
        <Empty>No promo codes yet.</Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {promos.map((promo) => (
            <li key={promo.code} className="border-2 border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-[16px] font-bold tracking-[0.04em]">{promo.code}</span>
                    {promo.live ? <Flag tone="warn">Live</Flag> : <Flag>{promo.active ? "Expired" : "Off"}</Flag>}
                  </p>
                  <p className="mt-1 text-[14px]">{promo.label}</p>
                  <p className="mt-1 text-[13px] text-muted">
                    {describe(promo)}
                    {promo.expiresAt && ` · ends ${dateTime(promo.expiresAt)}`}
                  </p>
                </div>
                <div className="min-w-0 flex-1 md:max-w-xl">
                  <PromoRowActions promo={promo} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
