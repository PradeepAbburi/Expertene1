import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface Creator {
  user_id: string;
  monthly_price: number;
  yearly_price: number;
  perks: string[];
}

interface SubscriptionPlansProps {
  creator: Creator;
  onSubscribe: (creatorId: string, planType: 'monthly' | 'yearly') => void;
}

export function SubscriptionPlans({ creator, onSubscribe }: SubscriptionPlansProps) {
  const yearlyDiscount = Math.round((1 - (creator.yearly_price / (creator.monthly_price * 12))) * 100);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <CardContent className="p-0">
            <div className="text-center mb-2">
              <div className="font-semibold">${creator.monthly_price}</div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onSubscribe(creator.user_id, 'monthly')}
            >
              Subscribe Monthly
            </Button>
          </CardContent>
        </Card>

        <Card className="p-3 relative">
          <CardContent className="p-0">
            {yearlyDiscount > 0 && (
              <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                {yearlyDiscount}% off
              </Badge>
            )}
            <div className="text-center mb-2">
              <div className="font-semibold">${creator.yearly_price}</div>
              <div className="text-xs text-muted-foreground">per year</div>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => onSubscribe(creator.user_id, 'yearly')}
            >
              Subscribe Yearly
            </Button>
          </CardContent>
        </Card>
      </div>

      {creator.perks && creator.perks.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">What you get:</div>
          <div className="space-y-1">
            {creator.perks.map((perk, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}