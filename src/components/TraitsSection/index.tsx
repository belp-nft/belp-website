import clsx from "clsx";

const TRAITS = [
  {
    value: "550+",
    label: "Unique Traits",
    highlight: true,
  },
  {
    value: "9,900",
    label: "Collection Size",
  },
  {
    value: "100",
    label: "Rare Genesis NFTs",
  },
];

export default function TraitsSection() {
  return (
    <section className="w-full flex flex-col items-center mt-8 mb-3 px-2">
      <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-5 mb-3 w-full">
        {TRAITS.map((item) => (
          <div
            key={item.label}
            className={clsx(
              "w-full md:w-[220px] lg:w-[260px] xl:w-[338px]",
              "px-4 py-5 md:p-8",
              "flex flex-col justify-center items-center rounded-2xl bg-gradient-to-b from-[#A39BFF] to-[#B0B6FF] shadow-lg relative cursor-pointer transition-all",
              "hover:scale-[1.04] active:scale-[0.98]",
              item.highlight
                ? "border-2 border-[#5C7CFF] shadow-[0_0_0_2px_rgba(92,124,255,0.2)]"
                : "border border-transparent"
            )}
            style={{
              boxSizing: "border-box",
            }}
          >
            <span className="text-[2rem] md:text-[2.5rem] font-bold text-white mb-1 leading-tight drop-shadow">
              {item.value}
            </span>
            <span className="text-white/80 text-sm md:text-base font-semibold tracking-wide">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="text-xs md:text-base text-center mt-11">
        Belpy consists of 100 rare Genesis NFTs and 9900 General Collection
        NFTs, featuring over 550 customizable traits and meticulously
        handcrafted, high-quality designs.
      </div>
    </section>
  );
}
