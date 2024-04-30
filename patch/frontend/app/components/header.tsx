import Image from "next/image";

export default function Header() {
  return (
    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
      <div
        className="fixed lg:static lg:h-auto lg:w-auto bg-black "
        style={{ padding: "0px 7px 6px 0px" }}
      >
        <Image
          className=" bg-black" // Add the "bg-black" class to set the background color to black
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
