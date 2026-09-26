import services from "@/app/salon/services.json";

/**
 * v1's prices: the `services.json` price, unless the salon has set another in
 * /admin/prices (`price_lists/v1`). Looked up by title against the JSON rather
 * than trusting a service object's own `price`, because the v1 cart is saved
 * to sessionStorage and would otherwise carry a price that has since changed.
 */
const BASE = new Map(services.filter((s) => !s.header && s.title).map((s) => [s.title, Number(s.price) || 0]));

export function v1Price(service, prices = {}) {
  const override = prices[service.title];
  if (Number.isFinite(override) && override >= 0) return override;
  return BASE.get(service.title) ?? service.price;
}

export function withV1Prices(list, prices) {
  return list.map((s) => ({ ...s, price: v1Price(s, prices) }));
}
