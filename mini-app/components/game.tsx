"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Option = {
  text: string;
  cost: number;
  points: number;
};

type Scenario = {
  prompt: string;
  options: Option[];
};

const SCENARIOS: Scenario[] = [
  {
    prompt: "Choose your morning beverage:",
    options: [
      { text: "Coffee (₱100)", cost: 100, points: -10 },
      { text: "Water (₱20)", cost: 20, points: 10 },
    ],
  },
  {
    prompt: "Lunch plan:",
    options: [
      { text: "Fast food (₱200)", cost: 200, points: -15 },
      { text: "Home-cooked (₱80)", cost: 80, points: 15 },
    ],
  },
  {
    prompt: "Transportation for the day:",
    options: [
      { text: "Taxi (₱150)", cost: 150, points: -10 },
      { text: "Jeepney (₱50)", cost: 50, points: 10 },
    ],
  },
  {
    prompt: "Shopping impulse:",
    options: [
      { text: "New shirt (₱300)", cost: 300, points: -20 },
      { text: "Save the money (₱0)", cost: 0, points: 20 },
    ],
  },
];

const DAILY_BUDGET_MIN = 500;
const DAILY_BUDGET_MAX = 1000;
const POINTS_PER_LEVEL = 100;
const STREAK_BONUS = 5;
const MONTHLY_STREAK_REQUIRED = 30;

type Progress = {
  points: number;
  streak: number;
  level: number;
  lastDate: string;
};

export default function Game() {
  const [budget, setBudget] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [currentScenario, setCurrentScenario] = useState<number>(0);
  const [progress, setProgress] = useState<Progress>({
    points: 0,
    streak: 0,
    level: 1,
    lastDate: "",
  });
  const [summary, setSummary] = useState<boolean>(false);

  // Load or initialize progress
  useEffect(() => {
    const stored = localStorage.getItem("budgetQuestProgress");
    if (stored) {
      const parsed: Progress = JSON.parse(stored);
      setProgress(parsed);
      const today = new Date().toISOString().split("T")[0];
      if (parsed.lastDate !== today) {
        // New day: reset daily state
        startNewDay();
      } else {
        // Continue existing day
        setBudget(parsed.points); // not used
      }
    } else {
      startNewDay();
    }
  }, []);

  const startNewDay = () => {
    const randomBudget =
      Math.floor(Math.random() * (DAILY_BUDGET_MAX - DAILY_BUDGET_MIN + 1)) +
      DAILY_BUDGET_MIN;
    setBudget(randomBudget);
    setRemaining(randomBudget);
    setPoints(0);
    setCurrentScenario(0);
    setSummary(false);
  };

  const handleOption = (option: Option) => {
    setRemaining((prev) => prev - option.cost);
    setPoints((prev) => prev + option.points);
    if (currentScenario + 1 < SCENARIOS.length) {
      setCurrentScenario((prev) => prev + 1);
    } else {
      // Day complete
      finishDay();
    }
  };

  const finishDay = () => {
    const today = new Date().toISOString().split("T")[0];
    let newStreak = progress.streak;
    if (progress.lastDate !== today) {
      newStreak = progress.streak + 1;
    }
    const newPoints = progress.points + points;
    const newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1;
    const updated: Progress = {
      points: newPoints,
      streak: newStreak,
      level: newLevel,
      lastDate: today,
    };
    setProgress(updated);
    localStorage.setItem("budgetQuestProgress", JSON.stringify(updated));
    setSummary(true);
  };

  const aiInsight = () => {
    if (points >= 0) {
      return "Great job! Your choices helped you stay within budget and earn points.";
    }
    return "Consider reviewing your spending choices to improve your budget management.";
  };

  if (summary) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Remaining Budget: ₱{remaining}</p>
          <p>Points Earned Today: {points}</p>
          <p>{aiInsight()}</p>
          <p>Streak: {progress.streak} days</p>
          <p>Level: {progress.level}</p>
          {progress.streak >= MONTHLY_STREAK_REQUIRED && (
            <Button className="mt-4" onClick={() => alert("NFT claimed!")}>
              Claim Monthly Achievement NFT
            </Button>
          )}
          <Button className="mt-4" onClick={startNewDay}>
            Start New Day
          </Button>
        </CardContent>
      </Card>
    );
  }

  const scenario = SCENARIOS[currentScenario];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Budget Quest</CardTitle>
        <p className="text-sm text-muted-foreground">
          Day {currentScenario + 1} of {SCENARIOS.length}
        </p>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          <span className="font-semibold">Daily Budget:</span> ₱{budget}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Remaining:</span> ₱{remaining}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Points:</span> {points}
        </p>
        <h3 className="mb-2 font-medium">{scenario.prompt}</h3>
        <div className="grid gap-2">
          {scenario.options.map((opt, idx) => (
            <Button
              key={idx}
              variant="outline"
              className={cn(
                "w-full justify-start",
                opt.points < 0 && "border-destructive text-destructive"
              )}
              onClick={() => handleOption(opt)}
            >
              {opt.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
