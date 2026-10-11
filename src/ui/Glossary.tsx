/** The glossary: a term shows only once its phenomenon has been seen (world-bible §8.3). */
import { chapter } from "../content";
import { unlockedTerms } from "../content/glossary";
import type { Save } from "../save/schema";
import { Dialog, FactItem, ReviewBadge } from "./common";
import { t } from "../i18n";

export function Glossary({ save, onClose }: { save: Save; onClose: () => void }) {
  const terms = unlockedTerms(save.discoveries);
  return (
    <Dialog title={t("Glossary")} onClose={onClose}>
      {terms.length === 0 ? (
        <p className="lede">
          {t("Words arrive here after you have seen what they name. Go and look first.")}
        </p>
      ) : (
        <dl className="truth">
          {terms.map((term) => {
            const ch = chapter(term.chapter);
            return (
              <div key={term.id} id={term.id}>
                <dt>
                  {term.term} <ReviewBadge status={term.reviewStatus} />
                </dt>
                <dd>
                  <ul className="facts">
                    <FactItem fact={term.definition} />
                  </ul>
                  {ch && (
                    <p className="small muted">
                      {t("Seen in chapter {n}: {title}", { n: ch.number, title: ch.title })}
                    </p>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </Dialog>
  );
}
