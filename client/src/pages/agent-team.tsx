
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function AgentTeam() {
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    }
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Voice Agent Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <h3 className="text-lg font-semibold">{agent.name}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Agent ID: {agent.agent_id}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
