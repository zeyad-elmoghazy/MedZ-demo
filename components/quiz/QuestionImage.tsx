import Image from 'next/image';

/**
 * QuestionImage — wraps next/image with quiz-specific defaults.
 *
 *   - `fill` + a relative parent so the image scales to the
 *     container instead of needing fixed width/height props.
 *   - `priority: false` because question images sit below the
 *     fold (the stem is usually read first); the LCP candidate
 *     is the question text, not the figure.
 *   - `sizes` tells the browser to download the 100vw version on
 *     phones and the 50vw version on tablets/desktop where the
 *     quiz layout is split.
 *   - `placeholder="blur"` shows a 1×1 PNG (the smallest possible
 *     blur) while the full image streams in. The data URI is
 *     intentionally generic — Next will re-encode the real image
 *     into AVIF/WebP via /_next/image so the blur seed doesn't
 *     need to match per-image.
 */
const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';

export function QuestionImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-64">
      <Image
        src={src}
        alt={alt}
        fill
        priority={false}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />
    </div>
  );
}
