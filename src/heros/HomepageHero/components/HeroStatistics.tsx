import React from "react";
import { Shield, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroStatisticsProps {
  translations: {
    keyStatistics: string;
    registeredJournalists: string;
    mediaOperators: string;
    complaintsResolved: string;
  };
  variant?: "glass" | "solid" | "minimal";
  className?: string;
}

export const HeroStatistics: React.FC<HeroStatisticsProps> = ({ 
  translations, 
  variant = "glass",
  className 
}) => {
  const stats = [
    {
      icon: Users,
      value: "450+",
      label: translations.registeredJournalists,
      color: "accent"
    },
    {
      icon: Shield,
      value: "40+",
      label: translations.mediaOperators,
      color: "primary"
    },
    {
      icon: FileText,
      value: "89%",
      label: translations.complaintsResolved,
      color: "secondary"
    }
  ];

  const containerStyles = {
    glass: "bg-white/15 backdrop-blur-md border border-white/30 shadow-xl",
    solid: "bg-card border border-border shadow-lg",
    minimal: "bg-transparent"
  };

  const textStyles = {
    glass: "text-white",
    solid: "text-foreground",
    minimal: "text-foreground"
  };

  return (
    <div className={cn(
      "rounded-xl p-6 sm:p-8",
      containerStyles[variant],
      className
    )}>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className={cn("text-lg font-semibold mb-2", textStyles[variant])}>
            {translations.keyStatistics}
          </h2>
          <div className="w-12 h-0.5 bg-secondary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                stat.color === "accent" && "bg-accent",
                stat.color === "primary" && "bg-primary",
                stat.color === "secondary" && "bg-secondary"
              )}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className={cn("text-2xl font-bold", textStyles[variant])}>
                  {stat.value}
                </div>
                <div className={cn(
                  "text-sm",
                  variant === "glass" ? "text-gray-300" : "text-muted-foreground"
                )}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};