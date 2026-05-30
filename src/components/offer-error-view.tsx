interface OfferErrorViewProps {
  message: string;
}

export function OfferErrorView({ message }: OfferErrorViewProps) {
  return (
    <main className="container-fluid">
      <article>
        <h1>Credit Card Offers</h1>
        <p>{message}</p>
      </article>
    </main>
  );
}

