"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { GridTileImage } from "components/grid/tile";
import { useState } from "react";

export function Gallery({
  images,
}: {
  images: { src: string; altText: string }[];
}) {
  const [imageIndex, setImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
  const previousImageIndex =
    imageIndex === 0 ? images.length - 1 : imageIndex - 1;

  const buttonClassName =
    "h-full px-6 transition-all ease-in-out hover:scale-110 hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer";

  return (
    <div>
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
        {images.map((img, idx) => (
          <img
            key={img.src + idx}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-150 ${
              idx === imageIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            alt={img.altText || "Product Image"}
            src={img.src}
            decoding="async"
            loading={idx === 0 ? "eager" : "lazy"}
          />
        ))}

        {images.length > 1 ? (
          <div className="absolute bottom-4 z-20 flex w-full justify-center">
            <div className="mx-auto flex h-11 items-center rounded-full border border-neutral-200 bg-white/90 px-2 text-neutral-700 shadow-md backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-200">
              <button
                type="button"
                onClick={() => setImageIndex(previousImageIndex)}
                aria-label="Previous product image"
                className={buttonClassName}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="mx-1 h-5 w-px bg-neutral-300 dark:bg-neutral-700"></div>
              <button
                type="button"
                onClick={() => setImageIndex(nextImageIndex)}
                aria-label="Next product image"
                className={buttonClassName}
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="my-6 flex items-center flex-wrap justify-center gap-3 overflow-auto py-1">
          {images.map((image, index) => {
            const isActive = index === imageIndex;

            return (
              <li key={image.src + index} className="h-20 w-20">
                <button
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label="Select product image"
                  className="h-full w-full cursor-pointer focus:outline-none"
                >
                  <GridTileImage
                    alt={image.altText}
                    src={image.src}
                    width={80}
                    height={80}
                    active={isActive}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
