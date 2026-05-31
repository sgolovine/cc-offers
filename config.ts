import { siGithub, siX } from "simple-icons";
import type { SimpleIcon } from "simple-icons";

interface SocialLink {
  label: string;
  href: string;
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
