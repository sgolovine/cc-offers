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
    href: "#"
  },
  {
    label: 'Download as CSV',
    href: "#"
  },
  {
    label: "Download SQLite database",
    href: "#"
  }
] satisfies BaseLink[]