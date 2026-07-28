export function extractUniqueCategories(products: any[]) {
  const cats = new Map();
  products.forEach((p) => {
    const pcats = p.categories || (p.category ? [p.category] : []);
    pcats.forEach((c: any) => {
      if (c && c.name) {
        if (!cats.has(c.name)) {
          cats.set(c.name, {
            name: c.name,
            image: c.image || c.icon || null,
            count: 0,
          });
        }
        cats.get(c.name).count += 1;
      }
    });
  });
  const extracted = Array.from(cats.values());
  return [
    { name: "All", count: products.filter((p) => p && p.id).length },
    ...extracted,
  ];
}

export function extractUniqueTags(products: any[]) {
  const tagMap = new Map();
  products.forEach((p) => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach((t: any) => {
        if (t && t.name && !tagMap.has(t.name)) {
          tagMap.set(t.name, { name: t.name });
        }
      });
    }
  });
  const extracted = Array.from(tagMap.values());
  if (extracted.length === 0) return [];
  return [{ name: "All" }, ...extracted];
}
