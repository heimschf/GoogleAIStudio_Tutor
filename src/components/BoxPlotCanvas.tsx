import React from "react";
import { computeQuantiles, computeMedian, computeIQR } from "../utils/rSim";

interface BoxPlotProps {
  values: number[];
  title: string;
}

export const BoxPlotCanvas: React.FC<BoxPlotProps> = ({ values, title }) => {
  if (!values || values.length === 0) {
    return <div className="p-4 text-center text-gray-500">No data values to plot.</div>;
  }

  // Calculate stats
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const q = computeQuantiles(values);
  const medianVal = computeMedian(values);
  const iqrVal = computeIQR(values);

  const q1 = q["25%"];
  const q3 = q["75%"];
  
  // Clean outliers: elements more than 1.5 * IQR away from Q1 and Q3
  const lowerBoundary = q1 - 1.5 * iqrVal;
  const upperBoundary = q3 + 1.5 * iqrVal;

  const nonOutliers = values.filter(v => v >= lowerBoundary && v <= upperBoundary);
  // Actual whisker limits (farthest points within standard ranges)
  const whiskerMin = nonOutliers.length > 0 ? Math.min(...nonOutliers) : minVal;
  const whiskerMax = nonOutliers.length > 0 ? Math.max(...nonOutliers) : maxVal;

  const outliers = values.filter(v => v < lowerBoundary || v > upperBoundary);

  // SVG Setup
  const width = 500;
  const height = 280;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 50;
  const paddingBottom = 50;

  const graphMin = Math.min(minVal - (iqrVal || 1) * 0.5, minVal);
  const graphMax = Math.max(maxVal + (iqrVal || 1) * 0.5, maxVal);
  const graphRange = graphMax - graphMin || 1;

  // Scale function to convert numbers to horizontal X values (left-to-right boxplot)
  const scaleX = (val: number) => {
    return paddingLeft + ((val - graphMin) / graphRange) * (width - paddingLeft - paddingRight);
  };

  const boxY = 100;
  const boxHeight = 70;
  const lineYStart = boxY;
  const lineYEnd = boxY + boxHeight;

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-inner text-white flex flex-col items-center">
      <h4 className="text-sm font-medium font-mono text-emerald-400 mb-2">{title}</h4>
      <div className="w-full overflow-x-auto flex justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const gridVal = graphMin + pct * graphRange;
            return (
              <g key={idx}>
                <line
                  x1={scaleX(gridVal)}
                  y1={30}
                  x2={scaleX(gridVal)}
                  y2={190}
                  stroke="#1e293b"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={scaleX(gridVal)}
                  y={210}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {gridVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Whisker Lines */}
          <line
            x1={scaleX(whiskerMin)}
            y1={boxY + boxHeight / 2}
            x2={scaleX(q1)}
            y2={boxY + boxHeight / 2}
            stroke="#94a3b8"
            strokeWidth={2}
          />
          <line
            x1={scaleX(q3)}
            y1={boxY + boxHeight / 2}
            x2={scaleX(whiskerMax)}
            y2={boxY + boxHeight / 2}
            stroke="#94a3b8"
            strokeWidth={2}
          />

          {/* Left Whisker Cap */}
          <line
            x1={scaleX(whiskerMin)}
            y1={boxY + 15}
            x2={scaleX(whiskerMin)}
            y2={boxY + boxHeight - 15}
            stroke="#e2e8f0"
            strokeWidth={2.5}
          />

          {/* Right Whisker Cap */}
          <line
            x1={scaleX(whiskerMax)}
            y1={boxY + 15}
            x2={scaleX(whiskerMax)}
            y2={boxY + boxHeight - 15}
            stroke="#e2e8f0"
            strokeWidth={2.5}
          />

          {/* IQR Box */}
          <rect
            x={scaleX(q1)}
            y={boxY}
            width={scaleX(q3) - scaleX(q1)}
            height={boxHeight}
            fill="#0f766e"
            fillOpacity="0.3"
            stroke="#14b8a6"
            strokeWidth={2.5}
            rx={2}
          />

          {/* Median Bar */}
          <line
            x1={scaleX(medianVal)}
            y1={lineYStart}
            x2={scaleX(medianVal)}
            y2={lineYEnd}
            stroke="#10b981"
            strokeWidth={4.5}
          />

          {/* Outliers */}
          {outliers.map((val, idx) => (
            <g key={idx}>
              <circle
                cx={scaleX(val)}
                cy={boxY + boxHeight / 2}
                r={5.5}
                fill="#f43f5e"
                stroke="#fda4af"
                strokeWidth={1.5}
              />
              <text
                x={scaleX(val)}
                y={boxY + boxHeight / 2 - 10}
                fill="#f43f5e"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                Outlier
              </text>
            </g>
          ))}

          {/* Annotated values labels */}
          <g>
            {/* Median Label */}
            <text
              x={scaleX(medianVal)}
              y={boxY - 14}
              fill="#34d399"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              Med: {medianVal.toFixed(1)}
            </text>
            <path
              d={`M ${scaleX(medianVal)} ${boxY - 10} L ${scaleX(medianVal)} ${boxY}`}
              stroke="#34d399"
              strokeWidth={1}
            />

            {/* Q1 Label */}
            <text
              x={scaleX(q1)}
              y={boxY + boxHeight + 20}
              fill="#2dd4bf"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="end"
              dx="-4"
            >
              Q1: {q1.toFixed(1)}
            </text>

            {/* Q3 Label */}
            <text
              x={scaleX(q3)}
              y={boxY + boxHeight + 20}
              fill="#2dd4bf"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="start"
              dx="4"
            >
              Q3: {q3.toFixed(1)}
            </text>

            {/* Min Whisker Label */}
            <text
              x={scaleX(whiskerMin)}
              y={boxY + boxHeight / 2 - 12}
              fill="#94a3b8"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Min: {whiskerMin.toFixed(1)}
            </text>

            {/* Max Whisker Label */}
            <text
              x={scaleX(whiskerMax)}
              y={boxY + boxHeight / 2 - 12}
              fill="#94a3b8"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Max: {whiskerMax.toFixed(1)}
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-2 w-full text-center text-xs text-slate-400 font-sans border-t border-slate-800 pt-2 flex justify-around">
        <span><strong className="text-emerald-400">Box width (IQR)</strong>: {iqrVal.toFixed(1)}</span>
        <span><strong className="text-slate-200">Total Size (n)</strong>: {values.length}</span>
      </div>
    </div>
  );
};
