import CategoryLandingPage from "../components/CategoryLandingPage";
import { fetchTableCatalog } from "../lib/catalog-ssr";

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
  const catalog = await fetchTableCatalog("brainrot");
  return {
    props: {
      categories: catalog.categories.slice(0, 36),
      products: catalog.products.slice(0, 24),
      stats: catalog.stats,
    },
  };
}

export default function BrainrotLandingPage(props) {
  return <CategoryLandingPage landingKey="brainrot" {...props} />;
}
