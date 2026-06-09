// A TypeScript simulator for standard R descriptive statistics commands
// Implements mean, median, sd, var, range, IQR, quantile, summary, hist, boxplot, sort, etc.
// Simulates a command history state with assigned vectors.

interface SimulatedPlot {
  type: "histogram" | "boxplot";
  values: number[];
  title: string;
  labels?: string[];
}

export interface SimulationResult {
  output: string;
  chart?: SimulatedPlot;
  error?: string;
  modifiedVariables: { [key: string]: number[] };
}

// Compute standard statistical metrics
export function computeMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function computeMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeVar(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const mean = computeMean(arr);
  // Unbiased sample variance (divided by n - 1)
  const sumSqDiffs = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  return sumSqDiffs / (arr.length - 1);
}

export function computeSD(arr: number[]): number {
  return Math.sqrt(computeVar(arr));
}

export function computeQuantiles(arr: number[]): {
  "0%": number;
  "25%": number;
  "50%": number;
  "75%": number;
  "100%": number;
} {
  if (arr.length === 0) {
    return { "0%": 0, "25%": 0, "50%": 0, "75%": 0, "100%": 0 };
  }
  const sorted = [...arr].sort((a, b) => a - b);
  
  // Standard linear interpolation quantile formula matching R's default (type 7)
  const getPercentile = (p: number) => {
    if (p <= 0) return sorted[0];
    if (p >= 1) return sorted[sorted.length - 1];
    
    const index = p * (sorted.length - 1);
    const low = Math.floor(index);
    const high = Math.ceil(index);
    const weight = index - low;
    
    return sorted[low] + weight * (sorted[high] - sorted[low]);
  };

  return {
    "0%": getPercentile(0),
    "25%": getPercentile(0.25),
    "50%": getPercentile(0.50),
    "75%": getPercentile(0.75),
    "100%": getPercentile(1),
  };
}

export function computeIQR(arr: number[]): number {
  const qs = computeQuantiles(arr);
  return qs["75%"] - qs["25%"];
}

export function computeMode(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const freq: { [key: number]: number } = {};
  let maxFreq = 0;
  
  arr.forEach((val) => {
    // Round to 3 decimals to avoid floating point key issues
    const rounded = Math.round(val * 1000) / 1000;
    freq[rounded] = (freq[rounded] || 0) + 1;
    if (freq[rounded] > maxFreq) {
      maxFreq = freq[rounded];
    }
  });

  const modes: number[] = [];
  Object.keys(freq).forEach((key) => {
    const val = Number(key);
    if (freq[val] === maxFreq) {
      modes.push(val);
    }
  });

  return modes.sort((a, b) => a - b);
}

// Main simulation engine
export function runRCode(
  code: string,
  existingVariables: { [key: string]: number[] } = {}
): SimulationResult {
  const variables = { ...existingVariables };
  const lines = code.split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith("#"));
  const outputs: string[] = [];
  let finalChart: SimulatedPlot | undefined = undefined;
  let hasError = false;
  let finalErrorMsg = "";

  // Helper to retrieve vector values
  const resolveVector = (expr: string): number[] | { error: string } => {
    expr = expr.trim();
    
    // Check if it's an inline vector c(1, 2, 3...)
    const inlineVectorMatch = expr.match(/^c\s*\((.*)\)$/);
    if (inlineVectorMatch) {
      const itemsStr = inlineVectorMatch[1].trim();
      if (itemsStr === "") return [];
      const values = itemsStr.split(",").map((s) => Number(s.trim()));
      if (values.some((v) => isNaN(v))) {
        return { error: "Error in c(...): non-numeric elements introduced" };
      }
      return values;
    }

    // Check if it's a stored variable name
    if (variables[expr]) {
      return variables[expr];
    }

    // Single number
    const singleNum = Number(expr);
    if (!isNaN(singleNum)) {
      return [singleNum];
    }

    return { error: `Error: object '${expr}' not found` };
  };

  for (const line of lines) {
    if (hasError) break;

    // 1. Vector Assignment: name <- c(1,2,3) or name = c(1,2,3) or inline numbers
    const assignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_\.]*)\s*(?:<-|=)\s*(.*)$/);
    if (assignmentMatch) {
      const varName = assignmentMatch[1].trim();
      const rhs = assignmentMatch[2].trim();
      
      const resolved = resolveVector(rhs);
      if ("error" in resolved) {
        hasError = true;
        finalErrorMsg = resolved.error;
        break;
      } else {
        variables[varName] = resolved;
        // R doesn't print anything on assignment, but let's confirm the size quietly or match standard R behavior (no output).
        continue;
      }
    }

    // 2. Custom Functions or Variable Inspections
    const functionMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_\.]*)\s*\((.*)\)$/);
    if (functionMatch) {
      const funcName = functionMatch[1].trim();
      const argExpr = functionMatch[2].trim();
      
      const vec = resolveVector(argExpr);
      if ("error" in vec) {
        hasError = true;
        finalErrorMsg = vec.error;
        break;
      }

      if (vec.length === 0) {
        outputs.push(`[1] NA (Empty Vector)`);
        continue;
      }

      switch (funcName) {
        case "mean": {
          const m = computeMean(vec);
          outputs.push(`[1] ${m.toFixed(4).replace(/\.?0+$/, "")}`);
          break;
        }
        case "median": {
          const med = computeMedian(vec);
          outputs.push(`[1] ${med}`);
          break;
        }
        case "sd": {
          if (vec.length < 2) {
            outputs.push(`[1] NA\nWarning message:\nIn sd(vec): NAs introduced by standard deviation of <= 1 elements`);
          } else {
            outputs.push(`[1] ${computeSD(vec).toFixed(4).replace(/\.?0+$/, "")}`);
          }
          break;
        }
        case "var": {
          if (vec.length < 2) {
            outputs.push(`[1] NA\nWarning message:\nIn var(vec): NAs introduced by variance of <= 1 elements`);
          } else {
            outputs.push(`[1] ${computeVar(vec).toFixed(4).replace(/\.?0+$/, "")}`);
          }
          break;
        }
        case "IQR": {
          outputs.push(`[1] ${computeIQR(vec).toFixed(4).replace(/\.?0+$/, "")}`);
          break;
        }
        case "range": {
          const minVal = Math.min(...vec);
          const maxVal = Math.max(...vec);
          outputs.push(`[1] ${minVal} ${maxVal}`);
          break;
        }
        case "min": {
          outputs.push(`[1] ${Math.min(...vec)}`);
          break;
        }
        case "max": {
          outputs.push(`[1] ${Math.max(...vec)}`);
          break;
        }
        case "length": {
          outputs.push(`[1] ${vec.length}`);
          break;
        }
        case "sum": {
          outputs.push(`[1] ${vec.reduce((a, b) => a + b, 0)}`);
          break;
        }
        case "sort": {
          const sorted = [...vec].sort((a, b) => a - b);
          outputs.push(sorted.map((v, i) => `[${i + 1}] ${v}`).join("\n"));
          break;
        }
        case "quantile": {
          const qs = computeQuantiles(vec);
          outputs.push(
            `   0%   25%   50%   75%  100% \n` +
            ` ${qs["0%"]}  ${qs["25%"]}  ${qs["50%"]}  ${qs["75%"]}  ${qs["100%"]}`
          );
          break;
        }
        case "summary": {
          const minVal = Math.min(...vec);
          const maxVal = Math.max(...vec);
          const meanVal = computeMean(vec);
          const medVal = computeMedian(vec);
          const q25 = computeQuantiles(vec)["25%"];
          const q75 = computeQuantiles(vec)["75%"];
          
          outputs.push(
            `   Min. 1st Qu.  Median    Mean 3rd Qu.    Max. \n` +
            `  ${minVal.toFixed(2)}   ${q25.toFixed(2)}   ${medVal.toFixed(2)}   ${meanVal.toFixed(2)}   ${q75.toFixed(2)}   ${maxVal.toFixed(2)}`
          );
          break;
        }
        case "hist": {
          finalChart = {
            type: "histogram",
            values: vec,
            title: `Histogram of ${argExpr}`,
          };
          outputs.push(`$breaks\n[1] (Rendered Visual histogram)\n\n$counts\n[1] (Interactive metrics available in plot)`);
          break;
        }
        case "boxplot": {
          finalChart = {
            type: "boxplot",
            values: vec,
            title: `Boxplot of ${argExpr}`,
          };
          const minVal = Math.min(...vec);
          const maxVal = Math.max(...vec);
          const medVal = computeMedian(vec);
          const q25 = computeQuantiles(vec)["25%"];
          const q75 = computeQuantiles(vec)["75%"];
          outputs.push(
            `$stats\n` +
            `     [,1]\n` +
            `[1,]  ${minVal}\n` +
            `[2,]  ${q25}\n` +
            `[3,]  ${medVal}\n` +
            `[4,]  ${q75}\n` +
            `[5,]  ${maxVal}\n\n` +
            `$n\n[1] ${vec.length}`
          );
          break;
        }
        default: {
          hasError = true;
          finalErrorMsg = `Error: could not find function "${funcName}"\n(This R Simulator currently supports: mean, median, sd, var, range, IQR, quantile, summary, hist, boxplot, sort, length, sum, min, max)`;
          break;
        }
      }
      continue;
    }

    // 3. Inspect raw variable or expression
    const vecDirect = resolveVector(line);
    if (!("error" in vecDirect)) {
      outputs.push(vecDirect.map((v, i) => `[${i + 1}] ${v}`).join(" "));
    } else {
      // General fallback error
      hasError = true;
      finalErrorMsg = `Error: object '${line}' not found or unrecognized syntax.\nYou can assign a variable like: scores <- c(80, 95, 76)\nor call functions like: mean(scores)`;
    }
  }

  if (hasError) {
    return {
      output: "",
      error: finalErrorMsg,
      modifiedVariables: existingVariables,
    };
  }

  return {
    output: outputs.join("\n\n"),
    chart: finalChart,
    modifiedVariables: variables,
  };
}
