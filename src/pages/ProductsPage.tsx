import { RankingsLab } from "@/components/home/RankingsLab/RankingsLab";
import { ProductDossier } from "@/components/home/ProductDossier/ProductDossier";
import { BrandUniverse } from "@/components/home/BrandUniverse/BrandUniverse";

/** ProductsPage — `/products`. Browse, rank, and inspect the catalog. */
export function ProductsPage() {
  return (
    <>
      <RankingsLab />
      <ProductDossier />
      <BrandUniverse />
    </>
  );
}
