import { Topic } from "../types";

export const curriculum: Topic[] = [
  {
    id: "central-tendency",
    title: "Central Tendency",
    subtitle: "Mean, Median & Mode",
    description: "Learn how to find the 'center' or typical value of a dataset using arithmetic means, robust medians, and modal frequencies in R.",
    difficulty: "Beginner",
    icon: "Target",
    lessons: [
      {
        id: "intro-stats-mean",
        title: "Introduction & The Mean",
        estimatedMinutes: 5,
        content: `### Welcome to Descriptive Statistics with R!

Descriptive statistics is all about **summarizing, displaying, and describing** data. Instead of looking at a raw list of 1,000 numbers, we compute a few core numbers (called **metrics**) to understand the general pattern.

The first type of metrics we compute are **Measures of Central Tendency**. These tell us where the "middle" or "center" of our data lies.

#### The Mean (Arithmetic Average)
The **mean** is the most common measure of center. You calculate it by adding all values together and dividing by the total number of values:
$$\\text{Mean} (\\bar{x}) = \\frac{\\sum_{i=1}^{n} x_i}{n}$$

#### Doing it in R
R makes calculating the mean incredibly easy. We use the \`mean()\` function.

1. First, we create a **vector** (a list of numbers) using the combine function \`c()\`, and assign it to a variable using the assign operator \`<-\`:
\`\`\`R
scores <- c(85, 90, 78, 92, 88)
\`\`\`
2. Next, we pass our variable into \`mean()\`:
\`\`\`R
mean(scores)
# Output: [1] 86.6
\`\`\`

Let's run some code in the terminal to the right to see it in action! Use \`scores <- c(85, 90, 78, 92, 88)\` and then \`mean(scores)\`.`,
        rSnippet: "scores <- c(85, 90, 78, 92, 88)\nmean(scores)"
      },
      {
        id: "median-mode",
        title: "Median & The Pitfalls of Outliers",
        estimatedMinutes: 6,
        content: `### The Median & Outliers

What happens if one of our test scores is extremely low or high? Let's say one student scored \`10\` instead of \`85\`. This extremely unusual value is called an **outlier**.

If we calculate the mean of \`c(10, 90, 78, 92, 88)\`, the mean drops to \`71.6\`. Does that accurately represent how most of the class did? No! The mean is highly sensitive to outliers.

#### The Median (The Physical Middle)
To solve this, we use the **median**. The median is the physical middle value when the data is sorted.
- If we have an **odd** number of values, it's the exact middle value.
- If we have an **even** number of values, it's the average of the two middle values.

Because the median is based on positional order rather than arithmetic sums, **it is robust to outliers**.

#### Calculating in R
In R, we calculate this using the \`median()\` function:
\`\`\`R
scores_with_outlier <- c(10, 90, 78, 92, 88)
median(scores_with_outlier)
# Output: [1] 88
\`\`\`
See how the median remains \`88\` (very typical) while the mean was dragged down to \`71.6\`? 

#### The Mode (Most Frequent)
The **mode** is the value that appears most frequently in a dataset. 
*Note: R doesn't have a simple, built-in single function for mode out of the box because it's less common in core statistics, but we can inspect frequencies easily. We can write simulated mode checks.*`,
        rSnippet: "scores_outlier <- c(10, 90, 78, 92, 88)\nmean(scores_outlier)\nmedian(scores_outlier)"
      }
    ],
    quizzes: [
      {
        id: "q_ct_1",
        question: "Why would you choose to report the Median instead of the Mean for a school district's household incomes?",
        options: [
          "The mean is harder to calculate in R.",
          "Income distributions often have extreme high-earning outliers, which bias the mean upwards. The median is robust.",
          "The median always has a higher value.",
          "R does not allow calculating the mean of currency."
        ],
        correctAnswerIndex: 1,
        explanation: "Income data is typically highly skewed with extreme outliers (billionaires/millionaires). These pull the Mean dramatically upwards, whereas the Median represents the actual middle-class household. Hence, the median is a more robust indicator of central tendency."
      },
      {
        id: "q_ct_2",
        question: "How do you assign a vector containing numbers 4, 12, 18, and 22 to a variable named 'v' in R?",
        options: [
          "v = [4, 12, 18, 22]",
          "v <- vector(4, 12, 18, 22)",
          "v <- c(4, 12, 18, 22)",
          "create v(4, 12, 18, 22)"
        ],
        correctAnswerIndex: 2,
        explanation: "In R, vectors are constructed using the combine function 'c()', and assignment is traditionally performed using the '<-' arrow operator (though '=' is also permitted, '<-' is the standard R style convention)."
      },
      {
        id: "q_ct_3",
        question: "If a vector is c(2, 4, 6, 100), what are the computed median and mean?",
        options: [
          "Median = 5, Mean = 28",
          "Median = 4, Mean = 25",
          "Median = 6, Mean = 30",
          "Median = 5, Mean = 5"
        ],
        correctAnswerIndex: 0,
        explanation: "The sorted vector is c(2, 4, 6, 100). The length is 4 (even), so the median is the average of the two middle values (4 and 6), which is (4+6)/2 = 5. The mean is (2+4+6+100)/4 = 112/4 = 28."
      }
    ],
    challenge: {
      id: "ch_ct",
      taskDescription: "Calculate the arithmetic average (Mean) of the employee hours dataset.",
      instructionMarkdown: `### Central Tendency Challenge

You've been given a dataset representing the weekly hours worked by a small team: **\`employee_hours\`**.

**Your Tasks:**
1. Calculate the **Mean** of the \`employee_hours\` vector using R.
2. Note the difference if you calculated the median! (Optional)

*The dataset \`employee_hours\` has already been loaded into your environment list. You can call it directly.*`,
      placeholderCode: "# The 'employee_hours' vector is preloaded.\n# Use the mean() function to calculate its average:\n",
      initialDatasetName: "employee_hours",
      initialDataset: [35, 40, 42, 38, 45, 50, 37, 39, 41],
      validationMetric: "mean",
      validationTarget: 41.1111, // mean of [35,40,42,38,45,50,37,39,41] is 370 / 9 = 41.1111
      hint: "Simply call the mean() function with employee_hours as the argument: mean(employee_hours)",
      solutionCode: "mean(employee_hours)"
    }
  },
  {
    id: "dispersion",
    title: "Dispersion & Spread",
    subtitle: "Variance, SD & Range",
    description: "Measure the dispersion, variability, and spread of databases using ranges, IQRs, standard deviations, and variances in R.",
    difficulty: "Beginner",
    icon: "ShieldAlert",
    lessons: [
      {
        id: "range-iqr",
        title: "Range & Interquartile Range (IQR)",
        estimatedMinutes: 5,
        content: `### Measures of Dispersion

Knowing the center of your data is useful, but incomplete! For example, two classes might both have a mean test score of \`80%\`. But:
- Class A: Everyone scored between \`78%\` and \`82%\` (low spread).
- Class B: Scores ranged from \`50%\` to \`100%\` (high spread).

Measures of spread help us quantify this dispersion.

#### 1. The Range
The **range** is the simplest measure of spread. It's the difference between the maximum and minimum values.
In R, calling \`range()\` prints both the minimum and maximum values:
\`\`\`R
scores <- c(60, 75, 80, 85, 95)
range(scores)
# Output: [1] 60 95
\`\`\`

#### 2. The Interquartile Range (IQR)
The **IQR** measures the spread of the **middle 50%** of your data. It is the distance between the 1st quartile ($Q_1$ or 25th percentile) and the 3rd quartile ($Q_3$ or 75th percentile):
$$\\text{IQR} = Q_3 - Q_1$$

The IQR is a fantastic metric because, like the median, **it ignores extreme outliers** on either end.

#### Doing it in R
We use the \`IQR()\` function:
\`\`\`R
IQR(scores)
# Output: [1] 10
\`\`\`
Experiment by calculating the IQR of your own scores vector in the console!`,
        rSnippet: "scores <- c(60, 75, 80, 85, 95)\nrange(scores)\nIQR(scores)"
      },
      {
        id: "variance-sd",
        title: "Variance & Standard Deviation",
        estimatedMinutes: 7,
        content: `### Variance & Standard Deviation

How far do typical data points sit from the mean? To measure this, we use the standard metrics **Variance** and **Standard Deviation**.

#### Variance ($s^2$)
Variance is the average of the squared differences from the Mean. Because it squares differences, its units are squared (e.g., if our data is heights in $cm$, variance is in $cm^2$).
$$\\text{Variance} (s^2) = \\frac{\\sum_{i=1}^{n} (x_i - \\bar{x})^2}{n - 1}$$
*We divide by $n - 1$ instead of $n$ for sample data to correct for sample-selection bias (known as Bessel's Correction).*

In R, variance is computed using \`var()\`:
\`\`\`R
var(scores)
\`\`\`

#### Standard Deviation ($s$)
To return our spread metric to the **original unit of measurement** ($cm$ instead of $cm^2$), we take the square root of the variance. This is the **Standard Deviation (SD)**:
$$s = \\sqrt{s^2}$$

The standard deviation represents the typical distance a data point deviates from the mean.
- A **low SD** means points are tightly clustered around the mean.
- A **high SD** means points are widely spread out.

#### Doing it in R
We use the \`sd()\` function:
\`\`\`R
sd(scores)
\`\`\`

Let's run some dispersion calculations in the terminal!`,
        rSnippet: "scores <- c(60, 75, 80, 85, 95)\nvar(scores)\nsd(scores)"
      }
    ],
    quizzes: [
      {
        id: "q_ds_1",
        question: "What is Bessel's Correction, and why does R's var() and sd() function divide by (n - 1) instead of n?",
        options: [
          "It corrects for rounding errors in computer processors.",
          "It guarantees the result is a whole integer.",
          "Dividing by n under-estimates variability in samples. Dividing by n - 1 provides an unbiased estimator of the true population variance.",
          "It is a legacy rule from old versions of R and has no mathematical basis."
        ],
        correctAnswerIndex: 2,
        explanation: "When calculating standard deviation or variance from a sample, using 'n' in the denominator consistently underestimates the true population dispersion. Dividing by 'n - 1' (Bessel's Correction) statistically corrects this systematic bias, providing an unbiased estimator."
      },
      {
        id: "q_ds_2",
        question: "If a dataset consists of identical numbers: c(10, 10, 10, 10), what are its variance and standard deviation?",
        options: [
          "Variance = 10, SD = 10",
          "Variance = 0, SD = 0",
          "Variance = 1, SD = 1",
          "R will throw an error division by zero"
        ],
        correctAnswerIndex: 1,
        explanation: "Since there is zero spread or differences from the mean (all values are exactly 10), the sample variance and sample standard deviation are both exactly 0."
      }
    ],
    challenge: {
      id: "ch_ds",
      taskDescription: "Find the sample Standard Deviation (sd) of the daily commute times dataset.",
      instructionMarkdown: `### Dispersion Challenge

We have gathered the active commute time (in minutes) for a worker over two weeks: **\`commute_times\`**.

**Your Tasks:**
1. Compute the **Standard Deviation** of \`commute_times\` using R's built-in command.
2. Observe how spread out the values are!

*The dataset \`commute_times\` has already been created for you.*`,
      placeholderCode: "# Calculate the standard deviation (SD) of commute_times:\n",
      initialDatasetName: "commute_times",
      initialDataset: [18, 25, 45, 20, 15, 30, 22, 28, 40, 19],
      validationMetric: "sd",
      validationTarget: 9.6032, // sd of [18,25,45,20,15,30,22,28,40,19] -> var = 92.22..., sd = 9.6032
      hint: "Use the sd() function: sd(commute_times)",
      solutionCode: "sd(commute_times)"
    }
  },
  {
    id: "summaries",
    title: "Summarizing Data",
    subtitle: "Quantiles & Summary()",
    description: "Learn to divide data into quarters (quartiles) and generate clean summaries with multi-metric indices in R.",
    difficulty: "Beginner",
    icon: "Sliders",
    lessons: [
      {
        id: "quantiles-percentiles",
        title: "Quantiles & Percentiles",
        estimatedMinutes: 5,
        content: `### Quantiles and Percentiles

Have you ever taken a standardized test and been told youscored in the **90th percentile**? This means you scored higher than 90% of all test takers.

In statistics, **percentiles** divide a sorted database into 100 equal parts. **Quantiles** are a more general term, dividing data into equal intervals.

#### Quartiles (Dividing into Fourths)
The most common quantiles are **quartiles**, which divide data into four equal parts (quarters):
- **0th Percentile**: The Minimum value.
- **25th Percentile ($Q_1$)**: The First Quartile. 25% of data is below this point.
- **50th Percentile ($Q_2$)**: The Median. 50% of data is below this point.
- **75th Percentile ($Q_3$)**: The Third Quartile. 75% of data is below this point.
- **100th Percentile**: The Maximum value.

#### Doing it in R
We can get these percentiles using the \`quantile()\` function:
\`\`\`R
rainfall <- c(1.2, 0.4, 2.8, 3.1, 0.2, 1.5, 0.9, 2.0)
quantile(rainfall)
\`\`\`
R will print the 0%, 25%, 50%, 75%, and 100% quantile marks!

Let's try executing it:`,
        rSnippet: "rainfall <- c(1.2, 0.4, 2.8, 3.1, 0.2, 1.5, 0.9, 2.0)\nquantile(rainfall)"
      },
      {
        id: "summary-command",
        title: "The Multi-Metric summary() Command",
        estimatedMinutes: 4,
        content: `### R's Powerful summary() command

When exploring a new dataset for the very first time, data scientists rarely run individual functions like \`mean()\`, \`median()\`, \`min()\`, and \`max()\` separately.

Instead, they run a single, exceptionally useful function: **\`summary()\`**.

Calling \`summary()\` on a numeric vector outputs a beautifully structured **five-number summary plus the arithmetic mean**:
1. **Min.** (Minimum value)
2. **1st Qu.** (25th percentile / $Q_1$)
3. **Median** (50th percentile / $Q_2$)
4. **Mean** (Arithmetic Average)
5. **3rd Qu.** (75th percentile / $Q_3$)
6. **Max.** (Maximum value)

#### Example in R
\`\`\`R
summary(rainfall)
# Output:
#   Min. 1st Qu.  Median    Mean 3rd Qu.    Max. 
#   0.20    0.78    1.35    1.51    2.20    3.10
\`\`\`

With just one command, we can instantly tell that:
- The standard rainfall is around \`1.35\` or \`1.51\` inches.
- 50% of all days recorded between \`0.78\` and \`2.20\` inches (the middle 50% / IQR).
- The highest rainfall recorded was \`3.10\` inches.

Let's call the summary command in our terminal!`,
        rSnippet: "rainfall <- c(1.2, 0.4, 2.8, 3.1, 0.2, 1.5, 0.9, 2.0)\nsummary(rainfall)"
      }
    ],
    quizzes: [
      {
        id: "q_su_1",
        question: "Which six statistical metrics are returned when you run the summary() function on a numeric column in R?",
        options: [
          "Mean, Median, Mode, Core, Quantiles, Range",
          "Min, 1st Quartile, Median, Mean, 3rd Quartile, Max",
          "Count, Standard Deviation, Variance, Skewness, Kurtosis, Sum",
          "Start value, End value, Growth factor, Intercept, Slope, Residuals"
        ],
        correctAnswerIndex: 1,
        explanation: "The summary() command automatically outputs the Min, 1st Quartile, Median, Mean, 3rd Quartile, and Max of a numeric vector, serving as an outstanding initial descriptive overview."
      }
    ],
    challenge: {
      id: "ch_su",
      taskDescription: "Generate a multi-metric descriptive analysis of the weekly heights dataset using the summary() function.",
      instructionMarkdown: `### Summarization Challenge

A physical therapist measured the height (in cm) of members in a fitness group: **\`heights\`**.

**Your Tasks:**
1. Generate the complete statistical overview using R's **\`summary()\`** command.
2. Check the output to see the median, mean, and range qualities.

*The list variable \`heights\` is already preloaded in your workspace.*`,
      placeholderCode: "# Run the multi-metric summary command for heights:\n",
      initialDatasetName: "heights",
      initialDataset: [152, 168, 175, 160, 185, 192, 170, 163, 178, 156, 180, 171],
      validationMetric: "summary",
      validationTarget: "Min. 1st Qu.  Median    Mean 3rd Qu.    Max. ", // Verified by executing summary
      hint: "Use the summary() function: summary(heights)",
      solutionCode: "summary(heights)"
    }
  },
  {
    id: "visualizations",
    title: "Visualizing Distributions",
    subtitle: "Histograms & Boxplots",
    description: "Convert numeric columns into beautiful charts—histograms and box-and-whisker plots—using R plotting functions in the console.",
    difficulty: "Intermediate",
    icon: "BarChart3",
    lessons: [
      {
        id: "histograms-r",
        title: "Histograms",
        estimatedMinutes: 5,
        content: `### Visualizing Data

Numbers on a page are good, but pictures can be incredibly eye-opening! In descriptive statistics, we use visual charts to inspect the **distribution** (shape, peaks, symmetry, and tails) of our data.

#### Histograms
A **histogram** groups values into contiguous ranges called **bins** (intervals), and draws bars whose heights represent the *frequency* (count) of data points falling into each bin.

It shows us:
- Where data point frequencies peak (modes).
- The range outline.
- Whether the data has a symmetric bell curve shape, or is skewed to one side.

#### Creating a Histogram in R
We use the \`hist()\` function:
\`\`\`R
ages <- c(21, 23, 25, 22, 28, 35, 42, 19, 24, 30, 31, 38, 45, 50, 52)
hist(ages)
\`\`\`

When you run this command in our simulated terminal, **an interactive histogram plot will render directly on your screen!**

Try running \`hist(ages)\` in the R Sandbox to see this visual magic!`,
        rSnippet: "ages <- c(21, 23, 25, 22, 28, 35, 42, 19, 24, 30, 31, 38, 45, 50, 52)\nhist(ages)"
      },
      {
        id: "boxplots-r",
        title: "Boxpacks & Outliers (Boxplots)",
        estimatedMinutes: 6,
        content: `### Box-and-Whisker Plots (Boxplots)

A **boxplot** is a compact visual display of the five-number summary:
1. **The Box**: Starts at the 25th percentile ($Q_1$) and ends at the 75th percentile ($Q_3$). The width of the box represents the Interquartile Range (**IQR**).
2. **The Line inside the Box**: The position of the **Median**.
3. **The Whiskers**: Lines extending outwards representing the minimum and maximum values (excluding outliers).
4. **Outlier Dots**: Dots plotted individually beyond the whiskers, representing values that lie more than $1.5 \\times \\text{IQR}$ away from the quartiles.

Boxplots are exceptionally handy for comparing distributions and spotting outliers instantly.

#### Creating a Boxplot in R
We use the \`boxplot()\` function:
\`\`\`R
boxplot(ages)
\`\`\`

Running \`boxplot()\` inside our sandbox will render an elegant, descriptive interactive boxplot with labelled quartiles.

Let's test it out! Run \`boxplot(ages)\` in the dashboard console:`,
        rSnippet: "ages <- c(21, 23, 25, 22, 28, 35, 42, 19, 24, 30, 31, 38, 45, 50, 52)\nboxplot(ages)"
      }
    ],
    quizzes: [
      {
        id: "q_vi_1",
        question: "In a Boxplot, how is an outlier typically defined and represented?",
        options: [
          "Any value above the average mean, shown as a shaded square.",
          "Any data point that is more than 1.5 times the IQR (Interquartile Range) away from the 1st or 3rd quartiles, plotted as an individual point.",
          "The first five elements of the sorted vector, drawn as dashed lines.",
          "Any negative number, represented as a red background."
        ],
        correctAnswerIndex: 1,
        explanation: "The standard statistical definition for outliers in boxplots (Tukey's method) is any value lying beyond 1.5 * IQR above Q3 or below Q1. These are plotted as separate points beyond the ends of the whiskers."
      },
      {
        id: "q_vi_2",
        question: "What built-in R commands produce a histogram and a boxplot respectively?",
        options: [
          "histogram() and box_and_whisker()",
          "plot_hist() and plot_box()",
          "hist() and boxplot()",
          "draw(histogram) and draw(boxplot)"
        ],
        correctAnswerIndex: 2,
        explanation: "R uses the highly concise and optimized core functions 'hist()' and 'boxplot()' to generate these rich visualizations."
      }
    ],
    challenge: {
      id: "ch_vi",
      taskDescription: "Create a boxplot of the ages distribution dataset using the boxplot() command.",
      instructionMarkdown: `### Visualization Challenge

Your fitness group has a list of ages: **\`ages\`**.

**Your Tasks:**
1. Generate a Boxplot of the \`ages\` vector.
2. Spot the median value and quartiles visually!

*The dataset \`ages\` has been loaded into your workspace.*`,
      placeholderCode: "# Generate a boxplot distribution for ages:\n",
      initialDatasetName: "ages",
      initialDataset: [21, 23, 25, 22, 28, 35, 42, 19, 24, 30, 31, 38, 45, 50, 52],
      validationMetric: "boxplot",
      validationTarget: "boxplot", // Simply check that we run boxplot() on the vector
      hint: "Simply type: boxplot(ages)",
      solutionCode: "boxplot(ages)"
    }
  }
];
