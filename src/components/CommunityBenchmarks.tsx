import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, BarChart3, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CommunityBenchmarksProps {
  documentType?: string;
}

interface Benchmark {
  id: string;
  category: string;
  metric_name: string;
  metric_value: number;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
  percentile_90: number;
  sample_size: number;
  geography: string;
}

export const CommunityBenchmarks: React.FC<CommunityBenchmarksProps> = ({ documentType }) => {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBenchmarks();
  }, [documentType]);

  const fetchBenchmarks = async () => {
    try {
      setLoading(true);
      let query = supabase.from('community_benchmarks').select('*');
      
      if (documentType) {
        query = query.eq('category', documentType);
      }
      
      const { data, error } = await query.order('metric_name');
      
      if (error) throw error;
      setBenchmarks(data || []);
    } catch (error) {
      console.error('Error fetching benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentileColor = (value: number, benchmark: Benchmark): string => {
    if (value <= benchmark.percentile_25) return 'text-destructive';
    if (value <= benchmark.percentile_50) return 'text-warning';
    if (value <= benchmark.percentile_75) return 'text-primary';
    return 'text-success';
  };

  const getPercentileLabel = (value: number, benchmark: Benchmark): string => {
    if (value <= benchmark.percentile_25) return 'Bottom 25%';
    if (value <= benchmark.percentile_50) return 'Below Average';
    if (value <= benchmark.percentile_75) return 'Above Average';
    return 'Top 25%';
  };

  const formatMetricValue = (value: number, metricName: string): string => {
    if (metricName.includes('days')) return `${value} days`;
    if (metricName.includes('months')) return `${value} months`;
    if (metricName.includes('percent')) return `${value}%`;
    if (metricName.includes('fee') || metricName.includes('deposit')) return `$${value}`;
    return value.toString();
  };

  const getMetricDescription = (metricName: string): string => {
    const descriptions: Record<string, string> = {
      'termination_notice_days': 'How much advance notice is typically required to terminate',
      'security_deposit_months': 'How many months of payment are held as security deposit',
      'notice_period_days': 'Standard notice period for employment termination',
      'non_compete_months': 'Duration of typical non-compete restrictions',
      'cancellation_fee_percent': 'Percentage fee charged for early cancellation'
    };
    return descriptions[metricName] || 'Community average for this metric';
  };

  if (loading) {
    return (
      <Card className="card-professional">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold mb-2">Loading Community Data...</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-professional border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Community Benchmarks</span>
          </CardTitle>
          <p className="text-muted-foreground">
            See how your document terms compare to what others typically get
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <div className="font-semibold">Geographic Coverage</div>
                <div className="text-sm text-muted-foreground">US National Average</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-success/5 rounded-lg">
              <BarChart3 className="h-8 w-8 text-success" />
              <div>
                <div className="font-semibold">Sample Size</div>
                <div className="text-sm text-muted-foreground">
                  {benchmarks.reduce((sum, b) => sum + b.sample_size, 0).toLocaleString()} contracts analyzed
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {benchmarks.length > 0 ? (
        <div className="grid gap-6">
          {benchmarks.map((benchmark) => (
            <Card key={benchmark.id} className="card-professional">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="capitalize">
                      {benchmark.metric_name.replace(/_/g, ' ')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getMetricDescription(benchmark.metric_name)}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {benchmark.category.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Average */}
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-3xl font-bold text-foreground">
                      {formatMetricValue(benchmark.metric_value, benchmark.metric_name)}
                    </div>
                    <div className="text-sm text-muted-foreground">Community Average</div>
                  </div>

                  {/* Percentile Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Distribution</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-3 bg-destructive/5 rounded border border-destructive/20">
                        <div className="font-semibold text-destructive">
                          {formatMetricValue(benchmark.percentile_25, benchmark.metric_name)}
                        </div>
                        <div className="text-xs text-muted-foreground">25th percentile</div>
                      </div>
                      <div className="text-center p-3 bg-warning/5 rounded border border-warning/20">
                        <div className="font-semibold text-warning">
                          {formatMetricValue(benchmark.percentile_50, benchmark.metric_name)}
                        </div>
                        <div className="text-xs text-muted-foreground">Median</div>
                      </div>
                      <div className="text-center p-3 bg-primary/5 rounded border border-primary/20">
                        <div className="font-semibold text-primary">
                          {formatMetricValue(benchmark.percentile_75, benchmark.metric_name)}
                        </div>
                        <div className="text-xs text-muted-foreground">75th percentile</div>
                      </div>
                      <div className="text-center p-3 bg-success/5 rounded border border-success/20">
                        <div className="font-semibold text-success">
                          {formatMetricValue(benchmark.percentile_90, benchmark.metric_name)}
                        </div>
                        <div className="text-xs text-muted-foreground">90th percentile</div>
                      </div>
                    </div>

                    {/* Visual Distribution */}
                    <div className="relative">
                      <div className="h-2 bg-gradient-to-r from-destructive via-warning via-primary to-success rounded-full"></div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Worse</span>
                        <span>Better</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Info */}
                  <div className="flex justify-between items-center pt-2 border-t text-sm text-muted-foreground">
                    <span>Sample size: {benchmark.sample_size.toLocaleString()} contracts</span>
                    <span>Geography: {benchmark.geography.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-professional">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Benchmarks Available</h3>
            <p className="text-muted-foreground">
              {documentType 
                ? `No community data available for ${documentType} contracts yet.`
                : 'Upload and analyze a document to see relevant community benchmarks.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};