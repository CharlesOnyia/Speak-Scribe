import { ProductHeader } from "../ProductHeader";

export default function ProductHeaderExample() {
  return (
    <ProductHeader
      name="Premium Wireless Headphones"
      category="Electronics"
      rating={4.5}
      reviewCount={128}
      price="$199.99"
    />
  );
}
