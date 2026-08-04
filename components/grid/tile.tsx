"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import Label from "../label";

type GridTileImageProps = {
  isInteractive?: boolean;
  active?: boolean;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center";
  };
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800";

export function GridTileImage({
  isInteractive = true,
  active,
  priority,
  label,
  src,
  alt,
  width,
  height,
  className,
}: GridTileImageProps) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_FALLBACK);

  useEffect(() => {
    setImgSrc(src || DEFAULT_FALLBACK);
  }, [src]);

  return (
    <div
      className={clsx(
        "group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black",
        {
          relative: label,
          "border-2 border-blue-600": active,
          "border-neutral-200 dark:border-neutral-800": !active,
        },
      )}
    >
      {imgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={alt || ""}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setImgSrc(DEFAULT_FALLBACK)}
          className={clsx(
            "relative h-full w-full object-contain",
            {
              "transition duration-300 ease-in-out group-hover:scale-105":
                isInteractive,
            },
            className,
          )}
        />
      ) : null}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}
