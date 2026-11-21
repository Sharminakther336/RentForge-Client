
import Navbar from "@/components/navbar/Navbar";
import Banner from "@/components/banner/Banner";
import FeaturedEquipment from "@/components/equipment/FeaturedEquipment";
import Categories from "@/components/categories/Categories";
import WhyChooseUs from "@/components/why-choose-us/WhyChooseUs";
import Footer from "@/components/footer/Footer";

const steps = [
  {
    number: "01",
    title: "Find Equipment",
    description:
      "Explore our equipment collection and find the right tools for your project.",
  },
  {
    number: "02",
    title: "Book Your Rental",
    description:
      "Choose your preferred equipment and submit a rental booking request.",
  },
  {
    number: "03",
    title: "Use and Return",
    description:
      "Receive your equipment, complete your work, and return it according to the rental agreement.",
  },
];

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-[#F5F1E8]">
        <Navbar />

        {/* Home Banner */}
        <Banner />

        {/* Equipment and Categories */}
        <section
          id="equipment"
          className="scroll-mt-28"
        >
          <FeaturedEquipment />
          <Categories />
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="scroll-mt-28 px-5 py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="font-semibold tracking-widest text-[#C98B52]">
                SIMPLE PROCESS
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-[#24352D] md:text-4xl">
                How RentForge Works
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Renting equipment is simple. Follow these three steps
                to get the equipment you need.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-[#E9E0D2] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#24352D] text-xl font-bold text-white">
                    {step.number}
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[#24352D]">
                    {step.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* About */}
        <section
          id="about"
          className="scroll-mt-28 px-5 py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl rounded-3xl bg-[#24352D] px-7 py-12 text-center text-white md:px-16 md:py-16">
            <p className="font-semibold tracking-widest text-[#D8A36B]">
              ABOUT RENTFORGE
            </p>

            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Equipment Rental Made Easier
            </h2>

            <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-200">
              RentForge is an equipment rental platform designed to
              connect people who need equipment with equipment owners.
              Our goal is to make finding, booking and managing equipment
              rentals easier and more convenient.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
