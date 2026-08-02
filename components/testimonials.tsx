import { StarRating } from "components/ui/star-rating";

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Abul Hossain",
      role: "Commercial Tomato Farmer, Bogura",
      rating: 5,
      comment: "I purchased high-yield hybrid tomato seeds from Krishi Uddokta. The germination rate was over 95%! Exceptional quality and fast delivery.",
    },
    {
      id: 2,
      name: "Dr. Nazmul Islam",
      role: "Rooftop Agro Enthusiast, Dhaka",
      rating: 5,
      comment: "The organic vermicompost fertilizer transformed my rooftop garden. Truly 100% organic and eco-friendly products.",
    },
    {
      id: 3,
      name: "Kabir Mahmud",
      role: "Fruit Orchard Owner, Rajshahi",
      rating: 5,
      comment: "The battery-operated agriculture sprayer is extremely durable and saved hours of manual labor. Highly recommended!",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
          What Our Farmers Say
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Trusted by over 10,000+ commercial farmers and gardening enthusiasts across Bangladesh
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="space-y-3">
              <StarRating rating={t.rating} />
              <p className="text-xs text-neutral-700 italic dark:text-neutral-300">
                "{t.comment}"
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">{t.name}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
