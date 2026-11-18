import Navbar from "@/components/navbar/Navbar";
import Banner from "@/components/banner/Banner";
import FeaturedEquipment from "@/components/equipment/FeaturedEquipment";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <Navbar />
      <Banner />
      <FeaturedEquipment />
    </main>
  );
}