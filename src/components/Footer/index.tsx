"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const subject = encodeURIComponent("Contact BELPY — Let’s talk");
const body = encodeURIComponent(
  "Hi BELPY team,\n\nI’d like to discuss: [topic]\n\nName: \nContact: "
);

export default function BelpFooter() {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const socialIcons = [
    {
      name: "mail",
      icon: "/icons/mail.svg",
      tooltip: "Contact us",
      href: `https://mail.google.com/mail/?view=cm&to=ir@belpy.xyz&su=${subject}&body=${body}`,
    },
    {
      name: "document",
      icon: "/icons/document.svg",
      tooltip: "Whitepaper",
      href: "https://maindocs.gitbook.io/belp/documentation",
    },
    {
      name: "twitter",
      icon: "/icons/twitter.svg",
      tooltip: "X (Twitter)",
      href: "#",
    },
    {
      name: "telegram",
      icon: "/icons/telegram.svg",
      tooltip: "Telegram",
      href: "#",
    },
    {
      name: "discord",
      icon: "/icons/discord.svg",
      tooltip: "Discord",
      href: "#",
    },
  ];
  return (
    <footer className="bg-[#690078] pt-12 pb-6 w-full">
      <div className="footer-container w-full">
        <Image
          src="/belp-logo-2.svg"
          alt="belp"
          width={160}
          height={70}
          className="rounded-full mx-auto"
        />
        <hr className="border-t border-white mt-10" />

        <div className="flex gap-3 sm:gap-5 md:gap-[30px] py-5 items-center justify-center relative">
          {socialIcons.map((social) => (
            <div
              key={social.name}
              className="relative"
              onMouseEnter={() => setHoveredIcon(social.name)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              {social.href !== "#" ? (
                social.href.startsWith("mailto:") ? (
                  <a
                    href={social.href}
                    className="block hover:scale-110 transition-transform duration-200 cursor-pointer"
                  >
                    <Image
                      src={social.icon}
                      alt={social.tooltip}
                      width={50}
                      height={50}
                      className="w-full h-full object-contain filter"
                    />
                  </a>
                ) : (
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:scale-110 transition-transform duration-200 cursor-pointer"
                  >
                    <Image
                      src={social.icon}
                      alt={social.tooltip}
                      width={50}
                      height={50}
                      className="w-full h-full object-contain filter"
                    />
                  </Link>
                )
              ) : (
                <div className="block hover:scale-110 transition-transform duration-200 cursor-default opacity-85">
                  <Image
                    src={social.icon}
                    alt={social.tooltip}
                    width={50}
                    height={50}
                    className="w-full h-full object-contain filter"
                  />
                </div>
              )}

              {hoveredIcon === social.name && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap z-10">
                  {social.tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
