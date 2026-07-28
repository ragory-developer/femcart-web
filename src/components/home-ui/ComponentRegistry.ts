import Hero from "./Hero";
import TrustStrip from "./TrustStrip";
import Categories from "./Categories";
import FeaturedProducts from "./FeaturedProducts";
import SizeBanner from "./SizeBanner";
import BestSellers from "./BestSellers";
import NewArrivals from "./NewArrivals";
import LimitedOffers from "./LimitedOffers";
import Reviews from "./Reviews";
import WhyShop from "./WhyShop";
import Editorial from "./Editorial";
import PreOrder from "./PreOrder";
import Social from "./Social";
import Newsletter from "./Newsletter";
import SeoBlock from "./SeoBlock";

const ComponentRegistry: Record<string, any> = {
  Hero,
  TrustStrip,
  Categories,
  FeaturedProducts,
  SizeBanner,
  BestSellers,
  NewArrivals,
  LimitedOffers,
  Reviews,
  WhyShop,
  Editorial,
  PreOrder,
  Social,
  Newsletter,
  SeoBlock,
};

export default ComponentRegistry;
