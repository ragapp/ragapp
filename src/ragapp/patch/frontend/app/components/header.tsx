import Image from "next/image";

export default function Header() {
  return (
    <div className="z-10 flex max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
      <div
        className="bg-black w-auto inline-block"
        style={{ padding: "0px 7px 6px 0px" }}
      >
        <Image
          src="/logo.png"
          alt="RAGapp Logo"
          width={120}
          height={40}
          priority
        />
      </div>
    </div>
  );
}
