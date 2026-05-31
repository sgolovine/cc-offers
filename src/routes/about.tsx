import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <main className="container-fluid about-page">
      <h1>About</h1>
      <p>
        Hi, My name is Sunny and I built this website. I built this project out of frustration with how we look for credit cards today. Most sites that aggregate credit card offers are affiliate sites that get a commission when you sign up for a credit card. This leads to an inherent trust issue, am I being recommended a certain credit card because it's the best one for Travel/Dining/Groceries/etc? Or am I being recommended the card because the author gets the most commission when I sign up?
      </p>

      <p>
        This site started out as a personal dataset that I put together to find the best credit card offers. I wired up an AI agent to research every top credit card issuer in the United States and then research their current credit card offers. After assembling this dataset and subsequently signing up for a few of the offers, I thought about turning the data into one of those affiliate sites (and let me tell you it was tempting). But that felt dishonest so instead I'm releasing this data as open source, no affiliate links, no up-selling, just the raw data.
      </p>

      <p>
        You can view the data directly on this website and you can also download my raw data below.
      </p>

      <ul>
        <li><a href="#">Download SQLite Database</a></li>
        <li><a href="#">Download as XLSX</a></li>
        <li><a href="#">Download as CSV</a></li>
        <li><a href="#">View Project on Github</a></li>
      </ul>

      

      <Link to="/">Back to offers</Link>
    </main>
  );
}
