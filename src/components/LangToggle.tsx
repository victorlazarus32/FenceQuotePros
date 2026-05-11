import { setLangCookie } from "@/app/actions/setLangCookie";
import { LANG_LABEL, type Lang } from "@/lib/landing/lang";

type Props = {
  current: Lang;
  /** Where to redirect back to after the cookie is set. Defaults to "/" */
  returnTo?: string;
  /** Visual tone — "light" for dark backgrounds, "dark" for light ones. */
  tone?: "light" | "dark";
};

/**
 * Two pill links rendering "EN · ES". The active pill is filled with
 * brand orange; the other is muted. Clicking either submits the
 * setLangCookie Server Action, which persists a one-year cookie and
 * redirects back to `returnTo` (or the page that rendered the toggle).
 */
export default function LangToggle({
  current,
  returnTo = "/",
  tone = "light",
}: Props) {
  const muted = tone === "light" ? "text-paper/55" : "text-text-soft";
  const mutedHover =
    tone === "light" ? "hover:text-paper" : "hover:text-ink";
  const sep = tone === "light" ? "text-paper/30" : "text-text-soft/40";

  return (
    <div
      className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em]"
      aria-label="Language toggle"
    >
      <LangButton
        lang="en"
        active={current === "en"}
        returnTo={returnTo}
        muted={muted}
        mutedHover={mutedHover}
      />
      <span className={sep}>·</span>
      <LangButton
        lang="es"
        active={current === "es"}
        returnTo={returnTo}
        muted={muted}
        mutedHover={mutedHover}
      />
    </div>
  );
}

function LangButton({
  lang,
  active,
  returnTo,
  muted,
  mutedHover,
}: {
  lang: Lang;
  active: boolean;
  returnTo: string;
  muted: string;
  mutedHover: string;
}) {
  return (
    <form action={setLangCookie} className="inline-flex">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={returnTo} />
      <button
        type="submit"
        aria-pressed={active}
        aria-label={
          lang === "en" ? "Switch to English" : "Cambiar a Español"
        }
        className={
          active
            ? "px-2 py-1 bg-brand text-ink font-bold"
            : `px-2 py-1 ${muted} ${mutedHover} transition-colors`
        }
      >
        {LANG_LABEL[lang]}
      </button>
    </form>
  );
}
