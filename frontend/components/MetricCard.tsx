"use client";

import {
  DollarSign,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: string;
    label: string;
    positive?: boolean;
  };
  progress?: {
    current: number;
    total: number;
    label: string;
  };
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  iconBg, 
  iconColor,
  trend,
  progress,
  className = ""
}: MetricCardProps) {
  return (
    <div className={`card-hover bg-white rounded-2xl border border-slate-200 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          
          {trend && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`flex items-center gap-1 text-sm font-medium ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}>
                {trend.positive ? (
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
                )}
                {trend.value}
              </span>
              <span className="text-xs text-slate-500">{trend.label}</span>
            </div>
          )}

          {progress && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-600">{progress.label}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-indigo-500 to-purple-600"
                  style={{ width: `${Math.min((progress.current / progress.total) * 100, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round((progress.current / progress.total) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}