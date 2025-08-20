import Categories from "@/components/Categories";
import LastOrder from "@/components/LastOrder";

export default async function Home() {
  return (
    <div>
      <section className="rounded-2xl bg-red-600 text-white p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Craving Pizza?</h1>
          <p className="text-white/90 mt-1">Order your favorites in a few taps.</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow-300 text-black px-3 py-1 text-sm">🔥 Hot deals today</div>
        </div>
        <div className="text-5xl">🍕</div>
      </section>

      <div id="categories">
        <Categories />
      </div>
      <LastOrder />
    </div>
  );
}
