import Discord from "public/assets/icons/discord.svg";
import Twitter from "public/assets/icons/twitter.svg";
import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className="mt-auto max-h-[400px] w-full bg-white py-6">
      <div className="md:gap-8 mx-auto flex w-full max-w-[--page-width] flex-col items-center justify-start gap-4 px-[--page-padding] md:flex-row">
        <div className="flex items-center justify-center gap-4 md:justify-end">
          <Link
            className="group"
            href="http://discord.uma.xyz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="link to uma's discord server"
          >
            <Discord className="text-text h-6 w-6 transition-colors group-hover:text-red-600" />
          </Link>
          <Link
            className="group"
            href="https://twitter.com/UMAprotocol"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="link to uma's twitter page"
          >
            <Twitter className="text-text h-6 w-6 transition-colors group-hover:text-red-600" />
          </Link>
          <Link
            className="transition hover:text-red-600"
            href="https://docs.uma.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="link to uma's documentation"
          >
            Docs
          </Link>
        </div>
        <Link
          className="text-text opacity-50 transition-opacity hover:opacity-100"
          href="https://uma.xyz/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="link to uma's terms of service page"
        >
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
