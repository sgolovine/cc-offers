import { Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CREDIT_CARD_OFFER_FIELDS,
  type CreditCardOfferField,
  type CreditCardOfferFieldKey,
  formatOfferValue,
  formatRawJson,
} from "../../data/credit-card-offer-fields";
import type { CreditCardOfferSeed } from "../../data/credit-card-offers.seed";
import { SaveOfferButton } from "../../components/save-offer-button";
import { useSavedOffers } from "../../hooks/use-saved-offers";
import { useOfferDetails } from "./use-offer-details";

type OfferDetailsProps = {
  offerId: string;
};

type OfferDetailsTab = {
  value: string;
  label: string;
  fields: readonly CreditCardOfferFieldKey[];
};

const OFFER_DETAIL_TABS = [
  {
    value: "overview",
    label: "Overview",
    fields: [
      "id",
      "issuer",
      "card_offer",
      "issuer_partner",
      "segment",
      "category",
    ],
  },
  {
    value: "offer",
    label: "Offer",
    fields: [
      "welcome_intro_offer",
      "bonus_miles",
      "bonus_miles_type",
      "cash_bonus",
      "cash_bonus_type",
      "spend_requirement",
      "spend_requirement_extra_reqs",
      "spend_timeframe_days_tier_1",
      "spend_timeframe_days_tier_2",
      "spend_requirement_timing",
    ],
  },
  {
    value: "rates-fees",
    label: "Rates & Fees",
    fields: [
      "base_annual_fee_usd",
      "additional_user_annual_fee_usd",
      "additional_requirements_annual_fee",
      "intro_apr",
      "regular_apr",
    ],
  },
  {
    value: "rewards-notes",
    label: "Rewards & Notes",
    fields: ["rewards_key_perks", "notes"],
  },
  {
    value: "source-data",
    label: "Source Data",
    fields: [
      "source_url",
      "source_basis",
      "retrieved",
      "raw_json",
      "created_at",
      "updated_at",
    ],
  },
] as const satisfies readonly OfferDetailsTab[];

const OFFER_FIELD_BY_KEY = new Map<CreditCardOfferFieldKey, CreditCardOfferField>(
  CREDIT_CARD_OFFER_FIELDS.map((field) => [field.key, field]),
);

export function OfferDetails({ offerId }: OfferDetailsProps) {
  const { offer, offerState, status } = useOfferDetails(offerId);
  const { isOfferSaved, toggleSavedOffer } = useSavedOffers();

  if (status === "error") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
        <BackToOffers />
        <StatusCard
          title="Offer unavailable"
          message={offerState.error?.message ?? "Something went wrong."}
        />
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          <span>Loading offer&hellip;</span>
        </div>
      </main>
    );
  }

  if (status === "not-found") {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
        <BackToOffers />
        <StatusCard
          title="Offer not found"
          message={`No credit card offer was found for ID ${offerId}.`}
        />
      </main>
    );
  }

  if (!offer) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
        <BackToOffers />
        <StatusCard
          title="Offer data unavailable"
          message={`No details are available for offer ID ${offerId}.`}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
      <BackToOffers />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl leading-tight">
            {offer.card_offer}
          </CardTitle>
          <CardDescription>{offer.issuer}</CardDescription>
          <CardAction>
            <SaveOfferButton
              offerName={offer.card_offer}
              isSaved={isOfferSaved(offer.id)}
              onToggle={() => toggleSavedOffer(offer.id)}
            />
          </CardAction>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue={OFFER_DETAIL_TABS[0].value}
            className="gap-4"
          >
            <TabsList className="h-auto w-full overflow-x-auto rounded-md">
              {OFFER_DETAIL_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {OFFER_DETAIL_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <OfferDetailsTable offer={offer} fieldKeys={tab.fields} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}

type OfferDetailsTableProps = {
  offer: CreditCardOfferSeed;
  fieldKeys: readonly CreditCardOfferFieldKey[];
};

function OfferDetailsTable({ offer, fieldKeys }: OfferDetailsTableProps) {
  return (
    <Table>
      <TableBody>
        {fieldKeys.map((fieldKey) => {
          const field = OFFER_FIELD_BY_KEY.get(fieldKey);

          if (!field) {
            return null;
          }

          return (
            <TableRow key={field.key}>
              <TableHead
                scope="row"
                className="w-56 whitespace-normal py-2 text-muted-foreground"
              >
                {field.label}
              </TableHead>
              <TableCell className="whitespace-normal py-2">
                <OfferFieldValue offer={offer} fieldKey={field.key} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

type OfferFieldValueProps = {
  offer: CreditCardOfferSeed;
  fieldKey: CreditCardOfferFieldKey;
};

function OfferFieldValue({ offer, fieldKey }: OfferFieldValueProps) {
  const value = offer[fieldKey];

  if (fieldKey === "source_url" && typeof value === "string") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-full items-center gap-1 text-primary underline-offset-4 hover:underline"
      >
        <span className="truncate">{value}</span>
        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
      </a>
    );
  }

  if (fieldKey === "raw_json") {
    return (
      <pre className="bg-muted max-h-96 overflow-auto rounded-md p-3 text-xs">
        <code>{formatRawJson(typeof value === "string" ? value : null)}</code>
      </pre>
    );
  }

  return formatOfferValue(value);
}

function BackToOffers() {
  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Offers
        </Link>
      </Button>
    </div>
  );
}

function StatusCard({
  title,
  message,
}: Readonly<{ title: string; message: string }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}
