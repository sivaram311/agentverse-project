"use client";

import { useVerseStore } from "@/lib/store";

export function IncidentStrip() {
  const brief = useVerseStore((s) => s.incidentBrief);
  const evidence = useVerseStore((s) => s.incidentEvidence);
  const fromProdDeck = useVerseStore((s) => s.incidentFromProdDeck);
  const dismissed = useVerseStore((s) => s.incidentDismissed);
  const returnUrl = useVerseStore((s) => s.returnUrl);
  const dismissIncident = useVerseStore((s) => s.dismissIncident);

  if (dismissed) return null;
  if (!brief && !fromProdDeck) return null;

  return (
    <div className="incident-strip" role="region" aria-label="Incident brief">
      <div className="incident-strip-body">
        {fromProdDeck ? (
          <strong>ProdDeck dispatch params received</strong>
        ) : (
          <strong>Brief</strong>
        )}
        {brief ? <p>{brief}</p> : null}
        {evidence ? (
          <p className="muted incident-evidence">Evidence: {evidence}</p>
        ) : null}
      </div>
      <div className="incident-strip-actions">
        <button type="button" className="ghost" onClick={() => dismissIncident()}>
          Dismiss
        </button>
        {returnUrl ? (
          <a className="ghost" href={returnUrl}>
            Back to Home
          </a>
        ) : null}
      </div>
    </div>
  );
}
