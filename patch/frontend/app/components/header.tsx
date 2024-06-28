import Image from "next/image";

export default function Header() {
  return (
    <div className="z-10 flex max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
      <div
        className="bg-black w-auto inline-block"
        style={{ padding: "0px 7px 6px 0px", backgroundColor: "#12390C" }} /*changed the background color into "#12390C" */
      >
        <Image
          src="/logo.png"
          alt="EffectZ Logo"
          width={120}
          height={40}
          priority
        />
      </div>
    </div>
  );
}
