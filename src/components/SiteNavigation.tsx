import { useEffect, useRef, useState } from "react";

const navigationItems = [
  { label: "Sobre", href: "#sobre" },
  { label: "Trajetória", href: "#trajetoria" },
  { label: "Stack", href: "#stack" },
  { label: "Cases", href: "#estudos-de-caso" },
  { label: "Projetos", href: "#projetos" },
  { label: "GitHub", href: "#github" },
  { label: "Contato", href: "#contato" },
] as const;

const trackedSections = ["#inicio", ...navigationItems.map(({ href }) => href)];

export function SiteNavigation() {
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#inicio");
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash || "#inicio");
    const updateVisibleSection = () => {
      const measuredHeaderHeight =
        document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      const headerHeight = measuredHeaderHeight > 0 ? measuredHeaderHeight : 72;
      const marker = headerHeight + 32;
      const sections = trackedSections
        .map((hash) => ({ hash, element: document.getElementById(hash.slice(1)) }))
        .filter(
          (entry): entry is { hash: string; element: HTMLElement } =>
            entry.element !== null,
        );

      const contact = sections.find(({ hash }) => hash === "#contato");
      if (
        contact &&
        contact.element.getBoundingClientRect().top <= window.innerHeight * 0.5
      ) {
        setActiveHash("#contato");
        return;
      }

      const visible = sections.find(({ element }) => {
        const rect = element.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });

      if (visible) setActiveHash(visible.hash);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);
    window.addEventListener("scroll", updateVisibleSection, { passive: true });
    return () => {
      window.removeEventListener("hashchange", updateHash);
      window.removeEventListener("scroll", updateVisibleSection);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setOpen(false);
      menuTriggerRef.current?.focus();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <nav aria-label="Navegação principal" className="site-nav">
        <a className="brand" href="#inicio" aria-label="Início" onClick={closeMenu}>
          <span aria-hidden="true">CR</span>
          <span>Caíque Rezende</span>
        </a>
        <button
          aria-controls="site-menu"
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="menu-trigger"
          onClick={() => setOpen((value) => !value)}
          ref={menuTriggerRef}
          type="button"
        >
          <span aria-hidden="true">{open ? "×" : "Menu"}</span>
        </button>
        <div className="nav-links" data-open={open} id="site-menu">
          {navigationItems.map((item) => (
            <a
              aria-current={activeHash === item.href ? "location" : undefined}
              href={item.href}
              key={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
