type ProgressBarProps = React.ComponentPropsWithoutRef<"div"> & {
  progress: number; // expressed as decimal
  secondaryColor: string; // background
  primaryColor: string; // foreground
  className?: string;
};

export function ProgressBar({
  secondaryColor,
  primaryColor,
  progress,
  ...props
}: ProgressBarProps) {
  return (
    <div
      style={{
        backgroundColor: secondaryColor,
      }}
      className="relative h-2 w-full overflow-hidden rounded-md"
      {...props}
    >
      <span
        className="absolute h-full"
        style={{
          left: 0,
          width: `${Math.min(progress * 100, 100)}%`, // 100% max
          minWidth: "12px",
          backgroundColor: primaryColor,
        }}
      />
    </div>
  );
}
