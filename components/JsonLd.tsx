export function JsonLd({ data }: { data: Record<string, unknown>[] }) {
  if (!data?.length) return null;
  return (
    <>
      {data.map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
      ))}
    </>
  );
}
