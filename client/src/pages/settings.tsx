
import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="p-6" style={{ backgroundColor: '#f2f1ea'}}>
     
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Voice Agent Configuration</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Sample settings content</p>
        </CardContent>
      </Card>
    </div>
  );
}
