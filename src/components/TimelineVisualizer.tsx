import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface TimelineVisualizerProps {
  dates: any[];
  obligations: any[];
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({ dates = [], obligations = [] }) => {
  return (
    <Card className="card-professional">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Legal Timeline & Obligations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dates.length > 0 || obligations.length > 0 ? (
            <>
              {dates.map((date, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-semibold">{date.description}</div>
                    <div className="text-sm text-muted-foreground">{date.date}</div>
                  </div>
                  <Badge>{date.type}</Badge>
                </div>
              ))}
              {obligations.map((obligation, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <div className="flex-1">
                    <div className="font-semibold">{obligation.description}</div>
                    <div className="text-sm text-muted-foreground">Party: {obligation.party}</div>
                  </div>
                  <Badge variant="outline">{obligation.frequency}</Badge>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Timeline Data</h3>
              <p className="text-muted-foreground">Important dates and obligations will appear here after analysis.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};