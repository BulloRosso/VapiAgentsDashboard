import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { subscribeToCallUpdates } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import type { VapiLog } from '@shared/schema';

export default function Dashboard() {
  const { data: logs = [] } = useQuery<VapiLog[]>({
    queryKey: ['/api/logs']
  });

  useEffect(() => {
    const unsubscribe = subscribeToCallUpdates(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    });
    return unsubscribe;
  }, []);

  const inProgressCalls = logs.filter(log => log.status === 'in-progress');
  const finishedCalls = logs.filter(log => log.status === 'ended');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">Voice Call Monitor</h1>
      </div>

      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              Active Calls ({inProgressCalls.length})
            </h2>
            {inProgressCalls.map(call => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              Completed Calls ({finishedCalls.length})
            </h2>
            {finishedCalls.map(call => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CallCard({ call }: { call: VapiLog }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            call.status === 'in-progress' ? 'bg-green-100 text-green-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {call.status}
          </span>
          {call.agentId && (
            <p className="mt-1 text-sm text-gray-500">Agent: {call.agentId}</p>
          )}
        </div>
        {call.durationSeconds && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {call.durationSeconds}s
          </div>
        )}
      </div>

      {call.summary && (
        <div className="mt-3">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <MessageSquare className="w-4 h-4 mr-1" />
            Summary
          </div>
          <p className="text-sm text-gray-700">{call.summary}</p>
        </div>
      )}

      {call.messages && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <MessageSquare className="w-4 h-4 mr-1" />
            Messages
          </div>
          {call.messages.map((msg: any, idx: number) => (
            <div key={idx} className={`text-sm p-2 rounded ${
              msg.role === 'assistant' ? 'bg-blue-50 text-blue-700' : 
              'bg-gray-50 text-gray-700'
            }`}>
              {msg.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}