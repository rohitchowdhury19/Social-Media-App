import React from 'react';
import { TrendData } from '../Data/TrendData';
import { cn } from '../../utils/clsx';
import { cardClass } from '../../utils/styles';

const TrendCard = () => {
  return (
    <div className={cn(cardClass, 'flex flex-col gap-4 pl-8')}>
      <h3 className="text-lg font-bold">Trending for you</h3>

      {TrendData.map((trend) => {
        return (
          <div className="flex flex-col gap-2" key={trend.name}>
            <span className="font-bold">#{trend.name}</span>
            <span className="text-[15px]">{trend.shares}k Shares</span>
          </div>
        )
      })}

    </div>
  )
}

export default TrendCard
