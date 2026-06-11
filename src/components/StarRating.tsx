import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
  showValue?: boolean;
  count?: number;
}

export function StarRating({ value, onChange, size = 16, readOnly = true, showValue, count }: StarRatingProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = value >= n;
          const half = !filled && value >= n - 0.5;
          return (
            <button
              key={n}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(n)}
              className={readOnly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
              aria-label={`${n} نجوم`}
            >
              <Star
                style={{ width: size, height: size }}
                className={
                  filled || half
                    ? "fill-accent text-accent"
                    : "fill-muted text-muted-foreground/40"
                }
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-foreground">
          {value > 0 ? value.toFixed(1) : "—"}
          {typeof count === "number" && (
            <span className="text-muted-foreground font-normal"> ({count})</span>
          )}
        </span>
      )}
    </div>
  );
}
