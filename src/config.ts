import { siGithub, siX } from "simple-icons";
import type { SimpleIcon } from "simple-icons";


interface BaseLink {
  label: string;
  href: string;

}

interface SocialLink extends BaseLink {
  icon: SimpleIcon;
}


export const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/sgolovine/cc-offers",
    icon: siGithub,
  },
  {
    label: "X",
    href: "https://x.com/sunnygg",
    icon: siX,
  },
] satisfies SocialLink[];

export const dataLinks = [
  {
    label: 'Download as XLSX',
    href: "https://github.com/sgolovine/cc-offers/raw/refs/heads/main/data/cc-offers-export.xlsx"
  },
  {
    label: 'Download as CSV',
    href: "https://raw.githubusercontent.com/sgolovine/cc-offers/refs/heads/main/data/cc-offers-export.csv"
  },
  {
    label: "Download SQLite database",
    href: "https://github.com/sgolovine/cc-offers/raw/refs/heads/main/data/cc-offers.sqlite"
  }
] satisfies BaseLink[]