import Hero from "@/components/layout/Hero";
import HomeMenu from "@/components/layout/HomeMenu";
import SectionHeader from "@/components/layout/SectionHeader";

export default function Home() {
  return (
    <>
      <Hero />
      <HomeMenu />
      <section className="my-16 text-center">
        <SectionHeader subHeader={"our story"} mainHeader={"About us"} />
        <div className="flex flex-col max-w-2xl gap-4 mx-auto mt-4 text-gray-500">
          <p className="">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aliquid
            architecto, amet, facilis repellat voluptatem quam optio ullam vero
            quis minus temporibus culpa fugit, quos veniam corrupti illum harum!
            Sequi, asperiores.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod
            laudantium reiciendis corporis? Cupiditate expedita natus ducimus
            accusantium esse quasi, consequatur, pariatur maiores velit totam
            placeat a quos delectus quisquam autem.
          </p>
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nemo
            libero cumque, obcaecati laudantium voluptate similique? Deleniti
            fugit aliquid nesciunt sed ratione, molestiae delectus beatae,
            impedit debitis, non omnis iusto nemo.
          </p>
        </div>
      </section>
      <section className="my-8 text-center">
        <SectionHeader subHeader={"Don't hesitate"} mainHeader={"Contact us"} />
        <div className="mt-8">
          <a
            href="tel:+84973123123"
            className="text-4xl text-gray-500 underline"
          >
            +84 973 123 123
          </a>
        </div>
      </section>
    </>
  );
}
