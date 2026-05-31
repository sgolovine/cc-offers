import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OfferErrorViewProps {
  message: string;
}

export function OfferErrorView({ message }: OfferErrorViewProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Credit Card Offers</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
