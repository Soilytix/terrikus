/** The glossary: a term shows only once its phenomenon has been seen (world-bible §8.3). */
import { chapter } from "../content";
import { unlockedTerms } from "../content/glossary";
import type { Save } from "../save/schema";
import { Dialog, FactItem, ReviewBadge } from "./common";

export function Glossary({ save, onClose }: { save: Save; onClose: () => void }) {
  const terms = unlockedTerms(save.discoveries);
  return (
    <Dialog title="Glossary" onClose={onClose}>
      {terms.length === 0 ? (
        <p className="lede">Words arrive here after you have seen what they name. Go and look first.</p>
      ) : (
        <dl className="truth">
          {terms.map((t) => {
            const ch = chapter(t.chapter);
            return (
              <div key={t.id} id={t.id}>
                <dt>
                  {t.term} <ReviewBadge status={t.reviewStatus} />
                </dt>
                <dd>
                  <ul className="facts">
                    <FactItem fact={t.definition} />
                  </ul>
                  {ch && (
                    <p className="small muted">
                      Seen in chapter {ch.number}: {ch.title}
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
