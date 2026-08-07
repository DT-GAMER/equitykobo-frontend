type StepProgressProps = {
  steps: string[];
  /** Zero-based index of the step currently being answered. */
  current: number;
};

/**
 * Segmented step progress.
 *
 * One thin bar per step, filled for completed steps and empty for upcoming
 * ones. It replaces a vertical list of five labelled rows, which on a phone
 * pushed the first question below the fold.
 *
 * The reference design labels each segment. That works for four short words
 * across a full-width bar; here there are five longer ones inside a 0.42fr
 * sidebar, where each segment gets ~53px and "Experience" needs ~65px. Five
 * labels only stop truncating past a ~1600px viewport, so instead of labelling
 * every segment the summary line underneath names the current step in full.
 */
function StepProgress({ steps, current }: StepProgressProps) {
  const total = steps.length;
  const safeCurrent = Math.min(Math.max(current, 0), total - 1);

  return (
    <div
      className="step-progress"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={safeCurrent + 1}
      aria-valuetext={`Step ${safeCurrent + 1} of ${total}: ${steps[safeCurrent]}`}
    >
      <ol className="step-progress-track">
        {steps.map((label, index) => (
          <li
            className={
              index < safeCurrent
                ? "step-segment done"
                : index === safeCurrent
                  ? "step-segment active"
                  : "step-segment"
            }
            key={label}
          >
            <span className="step-segment-bar" />
          </li>
        ))}
      </ol>

      <p className="step-progress-summary">
        <span>
          Step {safeCurrent + 1} of {total}
        </span>
        <strong>{steps[safeCurrent]}</strong>
      </p>
    </div>
  );
}

export default StepProgress;
