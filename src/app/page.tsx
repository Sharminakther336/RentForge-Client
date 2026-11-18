
import Navbar from "@/components/navbar/Navbar";
import Banner from "@/components/banner/Banner";
import FeaturedEquipment from "@/components/equipment/FeaturedEquipment";
import Categories from "@/components/categories/Categories";
import WhyChooseUs from "@/components/why-choose-us/WhyChooseUs";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-[#F5F1E8]">
        <Navbar />
        <Banner />
        <FeaturedEquipment />
        <Categories />
        <WhyChooseUs />
      </main>

      <Footer />
    </>
  );
}
