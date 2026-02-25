// EnrichmentAccess activities — SCO-10
// Stub activities for infrastructure validation

export async function lookup(
  founderId: string,
  _source: string,
): Promise<unknown> {
  console.log(
    `EnrichmentAccess.lookup not yet implemented — see SCO-10. founderId: ${founderId}`,
  );
  return null;
}

export async function verify(
  founderId: string,
  _data: unknown,
): Promise<boolean> {
  console.log(
    `EnrichmentAccess.verify not yet implemented — see SCO-10. founderId: ${founderId}`,
  );
  return false;
}

export async function supplement(
  founderId: string,
  _enrichmentData: unknown,
): Promise<void> {
  console.log(
    `EnrichmentAccess.supplement not yet implemented — see SCO-10. founderId: ${founderId}`,
  );
}
