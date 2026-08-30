interface HighlightBannerProps {
  title: string;
  imageUrl: string;
}

export function HighlightBanner({ title, imageUrl }: HighlightBannerProps) {
  return (
    <div
      className="relative flex h-40 items-center justify-center rounded-lg bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${imageUrl}')`,
      }}
    >
      <h3 className="text-center text-2xl font-bold text-white px-4">{title}</h3>
    </div>
  );
}
