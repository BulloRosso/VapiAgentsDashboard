import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Phone, Calendar, Clock, User, CheckCircle2, FileText, Plus, UserPlus, MessageSquare, X } from 'lucide-react';
import { subscribeToCallUpdates } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import type { VapiLog } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function VoiceAgentDashboard() {
  // Data fetching from dashboard(1)
  const { data: logs = [] } = useQuery<VapiLog[]>({
    queryKey: ['logs'],
    queryFn: async () => {
      console.log('Starting logs fetch from API...');
      const response = await fetch('https://149d18b5-fe3f-4ba0-b982-a82b868464c8-00-24mbvbm32azaf.spock.replit.dev/api/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      console.log('Raw logs from API:', data);
      return data || [];
    }
  });

  // Transform logs into the format expected by the UI
  const transformLogsToAgents = (logs: VapiLog[]) => {
    const { data: voiceAgents = [] } = useQuery({
      queryKey: ['agents'],
      queryFn: async () => {
        const response = await fetch('/api/agents');
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        return await response.json();
      }
    });

    const agentMap = new Map(voiceAgents.map(agent => [agent.agent_id, agent.name]));

    return logs.map(log => ({
      id: log.id,
      name: agentMap.get(log.agent_id) || '[unknown agent]',
      status: log.status === 'in_progress' ? 'in_call' : 'finished',
      customer: 'Customer',
      timeInStatus: `${Math.floor(log.duration_seconds / 60)}:${(log.duration_seconds % 60).toString().padStart(2, '0')}`,
      duration: log.duration_seconds / 60,
      summary: log.summary,
      messages: log.messages
    }));
  };

  // Log the state of logs after query
  console.log('Current logs state:', logs);

  // Log the transformed agents
  const agents = transformLogsToAgents(logs);
  console.log('Transformed agents:', agents);

  useEffect(() => {
    const unsubscribe = subscribeToCallUpdates(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    });
    return unsubscribe;
  }, []);

  // State management from voice-agent-dashboard
  const [humanHandovers] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    customerName: '',
    phoneNumber: '',
    topic: '',
    hour: '09',
    minute: '00',
    agent: ''
  });

  const { data: voiceAgents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      return data.map(agent => ({
        id: agent.agent_id,
        name: agent.name
      }));
    }
  });

 

  const scheduledAgents = agents.filter(a => a.status === 'scheduled');
  const activeAgents = agents.filter(a => a.status === 'in_call');
  const finishedAgents = agents.filter(a => a.status === 'finished');

  // Utility functions from voice-agent-dashboard
  function getStatusColor(status) {
    switch(status) {
      case 'in_call': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'waiting_callback': return 'bg-yellow-500';
      case 'finished': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  }

  function getStatusIcon(status) {
    switch(status) {
      case 'in_call': return <Phone className="w-6 h-6 text-white" />;
      case 'scheduled': return <Calendar className="w-6 h-6 text-white" />;
      case 'waiting_callback': return <Clock className="w-6 h-6 text-white" />;
      case 'finished': return <CheckCircle2 className="w-6 h-6 text-white" />;
      default: return <Clock className="w-6 h-6 text-white" />;
    }
  }

  function getDurationColor(minutes) {
    if (minutes < 1) return 'bg-green-500';
    if (minutes < 5) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  // Modal handling functions
  function handleEditScheduled(agent) {
    const [hours, minutes] = agent.scheduledTime.split(':');
    setScheduleForm({
      customerName: agent.customer,
      phoneNumber: agent.phoneNumber,
      topic: agent.topic,
      hour: hours,
      minute: minutes,
      agent: agent.agent
    });
    setEditingAgent(agent);
    setShowScheduleModal(true);
  }

  function handleCloseModal() {
    setShowScheduleModal(false);
    setEditingAgent(null);
    setScheduleForm({
      customerName: '',
      phoneNumber: '',
      topic: '',
      hour: '09',
      minute: '00',
      agent: ''
    });
  }

  function handleScheduleSubmit() {
  
    handleCloseModal();
  }

  function handleDeleteScheduled(agent) {
    
  }

  // Component definitions
  function AgentCard({ agent, onDelete, onEdit }) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
        <div 
          className={`p-4 ${getStatusColor(agent.status)} flex items-center justify-between ${agent.status === 'scheduled' ? 'cursor-pointer' : ''}`}
          onClick={() => agent.status === 'scheduled' ? onEdit?.(agent) : null}
        >
          <div className="flex items-center space-x-3">
            {getStatusIcon(agent.status)}
            <span className="text-white font-semibold">
              {agent.status === 'in_call' ? 'In Call' :
               agent.status === 'scheduled' ? 'Scheduled' :
               agent.status === 'waiting_callback' ? 'Waiting Callback' :
               'Finished'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {agent.duration && (
              <div className="flex items-center space-x-3 text-sm text-white">
                <Clock className="w-4 h-4" />
                <span>{agent.duration.toFixed(1)} min</span>
                <div className={`w-2 h-2 rounded-full ${getDurationColor(agent.duration)}`} />
              </div>
            )}
            {agent.status === 'scheduled' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(agent);
                }}
                className="text-white hover:text-red-200 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {showDetails && (
          <div className="p-4">
            <div className="flex items-center space-x-3">
              {agent.name.startsWith('[') ? (
                <User className="w-[30px] h-[30px] text-gray-500" />
              ) : (
                <img 
                  src={`/img/avatar-${agent.name.toLowerCase()}.jpg`}
                  alt={agent.name}
                  className="w-[30px] h-[30px] rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/img/avatar-default.jpg';
                  }}
                />
              )}
              <div>
                <p className="font-semibold text-gray-800">{agent.name}</p>
                <p className="text-sm text-gray-600">Customer: {agent.customer}</p>
              </div>
            </div>
            {agent.summary && (
              <div className="mt-3">
                <p className="text-sm text-gray-700">{agent.summary}</p>
              </div>
            )}
            {agent.messages && (
              <div className="mt-3 space-y-2">
                {typeof agent.messages === 'string' ? (
                  <div className="text-sm p-2 rounded bg-blue-50 text-blue-700">
                    {agent.messages}
                  </div>
                ) : Array.isArray(agent.messages) && agent.messages.map((msg, idx) => (
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
        )}
      </div>
    );
  }

  function Column({ title, agents, bgColor, headerBubbleColor, onAddSchedule, onDeleteAgent, onEditAgent }) {
    return (
      <div className="w-1/3 p-4 min-h-screen" style={{ backgroundColor: bgColor }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {onAddSchedule && (
              <button
                onClick={onAddSchedule}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
          <div className={`${headerBubbleColor} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold`}>
            {agents.length}
          </div>
        </div>
        <div className="overflow-y-auto max-h-screen pb-20">
          {agents.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onDelete={onDeleteAgent}
              onEdit={onEditAgent}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6 bg-white">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-800">Voice Agent Activity Hub</h1>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-medium transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <User className="w-6 h-6 text-red-700 mr-2" />
              <span className="font-semibold text-gray-800">Human Handovers</span>
              <div className="ml-3 bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                {humanHandovers}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <Column 
          title="Scheduled Calls" 
          agents={scheduledAgents} 
          bgColor="#EFF6FF"
          headerBubbleColor="bg-indigo-500"
          onAddSchedule={() => setShowScheduleModal(true)}
          onDeleteAgent={handleDeleteScheduled}
          onEditAgent={handleEditScheduled}
        />
        <Column 
          title="Active Calls" 
          agents={activeAgents} 
          bgColor="#F0FDF4"
          headerBubbleColor="bg-green-500"
        />
        <Column 
          title="Finished Today" 
          agents={finishedAgents} 
          bgColor="#f3f4f6"
          headerBubbleColor="bg-gray-500"
        />
      </div>

      <Dialog 
        open={showScheduleModal} 
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Scheduled Call' : 'Schedule New Call'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>
                <div className="flex items-center space-x-2 mb-2">
                  <UserPlus className="w-4 h-4 text-gray-500" />
                  <span>Customer Name</span>
                </div>
              </Label>
              <Input 
                value={scheduleForm.customerName}
                onChange={(e) => setScheduleForm({...scheduleForm, customerName: e.target.value})}
                placeholder="Enter customer name"
              />
            </div>
          <div className="space-y-2">
              <Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>Phone Number</span>
                </div>
              </Label>
              <Input 
                value={scheduleForm.phoneNumber}
                onChange={(e) => setScheduleForm({...scheduleForm, phoneNumber: e.target.value})}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span>Topic</span>
                </div>
              </Label>
              <Textarea 
                value={scheduleForm.topic}
                onChange={(e) => setScheduleForm({...scheduleForm, topic: e.target.value})}
                placeholder="Enter call topic and details"
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Schedule Time</span>
                </div>
              </Label>
              <div className="flex space-x-2">
                <Input 
                  type="number"
                  min="0"
                  max="23"
                  value={scheduleForm.hour}
                  onChange={(e) => setScheduleForm({...scheduleForm, hour: e.target.value.padStart(2, '0')})}
                  className="w-20"
                />
                <span className="flex items-center">:</span>
                <Input 
                  type="number"
                  min="0"
                  max="59"
                  value={scheduleForm.minute}
                  onChange={(e) => setScheduleForm({...scheduleForm, minute: e.target.value.padStart(2, '0')})}
                  className="w-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Voice Agent</span>
                </div>
              </Label>
              <Select 
                value={scheduleForm.agent}
                onValueChange={(value) => setScheduleForm({...scheduleForm, agent: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {voiceAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleScheduleSubmit}>
              {editingAgent ? 'Save Changes' : 'Schedule Call'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VoiceAgentDashboard;