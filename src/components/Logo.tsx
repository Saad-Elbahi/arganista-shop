import Image from "next/image";

// Official Arganista logo (transparent PNG, 900×535)
export function Logo({ className = "h-14", light = false, priority = false }: { className?: string; light?: boolean; priority?: boolean }) {
  return (
    <Image
      src={light ? "/images/brand/logo-light.png" : "/images/brand/logo.png"}
      alt="Arganista"
      width={900}
      height={535}
      priority={priority}
      className={`w-auto ${className}`}
    />
  );
}
