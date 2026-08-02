import clsx from "clsx";
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
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || ""}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
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
