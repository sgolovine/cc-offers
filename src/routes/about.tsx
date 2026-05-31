import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dataLinks, socialLinks } from "../config";

export const Route = createFileRoute("/about")({
  component: About,
});

const githubLink = socialLinks.find((link) => link.label === "GitHub");

function About() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Offers
          </Link>
        </Button>
      </div>

      <section className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">About</h1>
        </div>

        <div className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Hi, My name is Sunny and I built this website. I built this project
            out of frustration with how we look for credit cards today. Most
            sites that aggregate credit card offers are affiliate sites that get
            a commission when you sign up for a credit card. This leads to an
            inherent trust issue, am I being recommended a certain credit card
            because it&apos;s the best one for Travel/Dining/Groceries/etc? Or
            am I being recommended the card because the author gets the most
            commission when I sign up?
          </p>

          <p>
            This site started out as a personal dataset that I put together to
            find the best credit card offers. I wired up an AI agent to research
            every top credit card issuer in the United States and then research
            their current credit card offers. After assembling this dataset and
            subsequently signing up for a few of the offers, I thought about
            turning the data into one of those affiliate sites (and let me tell
            you it was tempting). But that felt dishonest so instead I&apos;m
            releasing this data as open source, no affiliate links, no
            up-selling, just the raw data.
          </p>
        </div>

        <div className="space-y-3 border-t pt-5">
          <p className="text-sm leading-6 text-muted-foreground">
            You can view the data directly on this website and you can also
            download my raw data below.
          </p>

          <div className="flex flex-wrap gap-2">
            {dataLinks.map((link) => (
              <Button asChild key={link.label} variant="outline" size="sm">
                <a href={link.href}>
                  <Download className="size-4" aria-hidden="true" />
                  {link.label}
                </a>
              </Button>
            ))}
            {githubLink ? (
              <Button asChild variant="outline" size="sm">
                <a href={githubLink.href} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  View Project on {githubLink.label}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
