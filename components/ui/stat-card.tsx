import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: ReactNode;
  status?: "default" | "connected" | "waiting" | "solo";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  status = "default",
  className = "" 
}: StatCardProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "connected":
        return "text-green-700 bg-green-50 border-green-200";
      case "waiting":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "solo":
        return "text-gray-700 bg-gray-50 border-gray-200";
      default:
        return "text-gray-900 bg-white border-gray-200";
    }
  };

  return (
    <Card className={`text-center ${getStatusStyles()} ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-center gap-1">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}