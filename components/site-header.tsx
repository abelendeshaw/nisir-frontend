"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { capabilities, capabilityName } from "@/lib/capabilities";
import { cn } from "@/lib/utils";
import { BrandLockup } from "@/components/brand";
import { ThemeToggle } from "@/components/theme";
import { Magnetic } from "@/components/motion";

const links = [
  { href: "/about", label: "About" },
  { href: "/store", label: "3D Store" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation, adjusted during render rather than
  // in an effect so it never causes a cascading re-render.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.dataset.menuOpen = String(menuOpen);
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-line bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/60"
          : "border-b border-transparent",
      )}
    >
      <div className="shell flex h-[76px] items-center justify-between gap-6 md:h-[86px]">
        <Link href="/" className="relative z-10 shrink-0" aria-label="Nisir Designs — home">
          <BrandLockup />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <NavLink href="/" active={isActive("/")}>
            Home
          </NavLink>

          {/* Capability mega-menu: opens on hover and on keyboard focus. */}
          <div className="group relative">
            <Link
              href="/#capabilities"
              className={cn(
                "label inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] text-muted transition-colors duration-300",
                "hover:text-fg group-focus-within:text-fg",
                pathname.startsWith("/capabilities") && "text-fg",
              )}
            >
              Capabilities
              <span className="text-accent transition-transform duration-500 group-hover:rotate-180 group-focus-within:rotate-180">
                ⌄
              </span>
            </Link>
            <div
              className={cn(
                "invisible absolute left-1/2 top-full w-[min(92vw,720px)] -translate-x-1/2 pt-4 opacity-0",
                "transition-[opacity,transform] duration-400 [transform:translate(-50%,8px)]",
                "group-hover:visible group-hover:opacity-100 group-hover:[transform:translate(-50%,0)]",
                "group-focus-within:visible group-focus-within:opacity-100 group-focus-within:[transform:translate(-50%,0)]",
              )}
            >
              <div className="card grid grid-cols-2 gap-1 p-3 shadow-[0_32px_80px_-24px_rgb(0_0_0/0.45)]">
                {capabilities.map((capability) => (
                  <Link
                    key={capability.slug}
                    href={`/capabilities/${capability.slug}`}
                    className="group/item flex items-start gap-3 rounded-xl px-3 py-3 transition-colors duration-300 hover:bg-line/60"
                  >
                    <span className="label mt-1 text-[10px] text-accent">{capability.number}</span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium leading-tight">
                        {capabilityName(capability)}
                      </span>
                      <span className="mt-1 block truncate text-[12px] text-subtle">
                        {capability.blurb}
                      </span>
                    </span>
                    <span className="ml-auto text-accent opacity-0 transition-opacity duration-300 group-hover/item:opacity-100">
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {links.map((link) => (
            <NavLink key={link.href} href={link.href} active={isActive(link.href)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <Magnetic className="hidden md:inline-flex">
            <Link href="/contact" className="btn btn-solid h-11 min-h-0 text-[10px]">
              Let’s build ↗
            </Link>
          </Magnetic>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="relative z-10 grid size-11 place-items-center rounded-full border border-line text-fg transition-colors hover:border-accent-bright lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={cn(
                  "absolute left-0 block h-px w-full bg-current transition-all duration-400",
                  menuOpen ? "top-1/2 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 block h-px bg-current transition-all duration-400",
                  menuOpen ? "bottom-1/2 w-full -rotate-45" : "w-3/4",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-0 -z-10 bg-bg/97 backdrop-blur-2xl lg:hidden"
          >
            <div className="shell flex h-dvh flex-col justify-between overflow-y-auto pb-10 pt-28">
              <nav className="flex flex-col" aria-label="Mobile">
                {[{ href: "/", label: "Home" }, ...links].map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index + 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      className="display display-md block border-b border-line py-4"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10"
              >
                <p className="eyebrow mb-4">Capabilities</p>
                <div className="grid gap-px">
                  {capabilities.map((capability) => (
                    <Link
                      key={capability.slug}
                      href={`/capabilities/${capability.slug}`}
                      className="flex items-center gap-4 border-b border-line py-3 text-[15px]"
                    >
                      <span className="label text-[10px] text-accent">{capability.number}</span>
                      {capabilityName(capability)}
                      <span className="ml-auto text-subtle">↗</span>
                    </Link>
                  ))}
                </div>
                <Link href="/contact" className="btn btn-solid mt-8 w-full">
                  Let’s build ↗
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "label relative rounded-full px-4 py-2.5 text-[11px] transition-colors duration-300",
        active ? "text-fg" : "text-muted hover:text-fg",
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-4 bottom-1.5 h-px origin-left bg-accent transition-transform duration-500",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </Link>
  );
}
