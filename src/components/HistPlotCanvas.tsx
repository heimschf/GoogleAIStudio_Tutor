import React from "react";

interface HistPlotProps {
  values: number[];
  title: string;
}

export const HistPlotCanvas: React.FC<HistPlotProps> = ({ values, title }) => {
  if (!values || values.length === 0) {
    return <div className="p-4 text-center text-gray-500">No data values to plot.</div>;
  }

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;

  // Sturges-style rule for number of bins, capped between 4 and 8
  const numBins = Math.max(4, Math.min(8, Math.ceil(Math.log2(values.length) + 1)));
  
  // Calculate bin cuts
  const binWidth = range === 0 ? 1 : range / numBins;
  const bins: { min: number; max: number; count: number; values: number[] }[] = [];

  for (let i = 0; i < numBins; i++) {
    const bMin = minVal + i * binWidth;
    const bMax = bMin + binWidth;
    bins.push({
      min: bMin,
      max: bMax,
      count: 0,
      values: [],
    });
  }

  // Place values inside bins. Handle the upper edge neatly.
  values.forEach((v) => {
    let placed = false;
    for (let i = 0; i < bins.length; i++) {
      const isLastBin = i === bins.length - 1;
      const withinBin = isLastBin
        ? v >= bins[i].min && v <= bins[i].max + 0.0001
        : v >= bins[i].min && v < bins[i].max;

      if (withinBin) {
        bins[i].count += 1;
        bins[i].values.push(v);
        placed = true;
        break;
      }
    }
    // Safeguard
    if (!placed && bins.length > 0) {
      if (v <= minVal) bins[0].count += 1;
      else if (v >= maxVal) bins[bins.length - 1].count += 1;
    }
  });

  const maxCount = Math.max(...bins.map((b) => b.count), 1);

  // SVG parameters
  const width = 500;
  const height = 280;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 45;
  const paddingBottom = 55;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Convert binary index to X coordinates
  const getX = (index: number) => {
    return paddingLeft + (index / numBins) * chartWidth;
  };

  // Convert frequencies to vertical Y coordinates
  const getY = (count: number) => {
    return paddingTop + chartHeight - (count / maxCount) * chartHeight;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-inner text-white flex flex-col items-center">
      <h4 className="text-sm font-medium font-mono text-emerald-400 mb-2">{title}</h4>
      <div className="w-full overflow-x-auto flex justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines for frequency (Y axis) */}
          {Array.from({ length: Math.min(6, maxCount + 1) }).map((_, idx, arr) => {
            const freqVal = Math.round((idx / (arr.length - 1)) * maxCount);
            const gridY = getY(freqVal);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={gridY}
                  x2={width - paddingRight}
                  y2={gridY}
                  stroke="#1e293b"
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 10}
                  y={gridY + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {freqVal}
                </text>
              </g>
            );
          })}

          {/* Histogram Bars */}
          {bins.map((bin, idx) => {
            const barX = getX(idx) + 2; // Margin between bars
            const barWidth = (chartWidth / numBins) - 4;
            const barY = getY(bin.count);
            const barHeight = paddingTop + chartHeight - barY;

            return (
              <g key={idx} className="group cursor-pointer">
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  fill="#0369a1"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  className="transition-colors hover:fill-sky-500"
                  rx={1}
                />
                {/* Count tooltip on hover */}
                <text
                  x={barX + barWidth / 2}
                  y={barY - 8}
                  fill="#38bdf8"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1"
                >
                  n = {bin.count}
                </text>
                {/* Bin Interval Labels (centered under bar) */}
                <text
                  x={barX + barWidth / 2}
                  y={paddingTop + chartHeight + 15}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  [{bin.min.toFixed(0)}-{bin.max.toFixed(0)}]
                </text>
              </g>
            );
          })}

          {/* X Axis */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#475569"
            strokeWidth={1.5}
          />

          {/* Y Axis */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + chartHeight}
            stroke="#475569"
            strokeWidth={1.5}
          />

          {/* Axis Titles */}
          <text
            x={paddingLeft + chartWidth / 2}
            y={paddingTop + chartHeight + 40}
            fill="#64748b"
            fontSize="10"
            fontFamily="sans-serif"
            fontWeight="bold"
            textAnchor="middle"
          >
            Interval Ranges (value boundaries)
          </text>

          <text
            transform={`rotate(-90 ${paddingLeft - 35} ${paddingTop + chartHeight / 2})`}
            x={paddingLeft - 35}
            y={paddingTop + chartHeight / 2}
            fill="#64748b"
            fontSize="10"
            fontFamily="sans-serif"
            fontWeight="bold"
            textAnchor="middle"
          >
            Frequency (count)
          </text>
        </svg>
      </div>

      <div className="mt-1 w-full text-center text-xs text-slate-400 font-sans border-t border-slate-800 pt-2 flex justify-around">
        <span><strong className="text-sky-400">Total Bins</strong>: {numBins}</span>
        <span><strong className="text-sky-400">Interval widths</strong>: {binWidth.toFixed(2)}</span>
      </div>
    </div>
  );
};
