import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContractTemplatesProps {
  documentType?: string;
}

export const ContractTemplates: React.FC<ContractTemplatesProps> = ({ documentType }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, [documentType]);

  const fetchTemplates = async () => {
    try {
      let query = supabase.from('contract_templates').select('*');
      if (documentType) {
        query = query.eq('category', documentType);
      }
      const { data } = await query.eq('is_verified', true).order('fairness_score', { ascending: false });
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-professional">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Better Contract Templates</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="border">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{template.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-success/10 text-success">
                      <Star className="h-3 w-3 mr-1" />
                      {template.fairness_score}/100
                    </Badge>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};