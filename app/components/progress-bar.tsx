
'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentDay: number;
  totalDays: number;
  daysRemaining: number;
  className?: string;
}

export default function ProgressBar({ currentDay, totalDays, daysRemaining, className = '' }: ProgressBarProps) {
  const progressPercentage = Math.min((currentDay / totalDays) * 100, 100);

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">2-Week Sprint Progress</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Day {currentDay} of {totalDays}</span>
          <span className="text-orange-600 font-medium">{daysRemaining} days remaining</span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut" 
            }}
          />
        </motion.div>
        
        {/* Day markers */}
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: totalDays - 1 }, (_, index) => (
            <div
              key={index}
              className="h-full border-r border-white border-opacity-50"
              style={{ marginLeft: `${((index + 1) / totalDays) * 100}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Start</span>
        <span>Week 1</span>
        <span>Week 2</span>
        <span>Launch</span>
      </div>
    </div>
  );
}
