import React, { useState } from "react";
import AppLayout from "../components/layouts/AppLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Clock, MessageSquare, CheckCircle, AlertCircle, Plus, Upload, Search, Filter } from "lucide-react";
import { toast } from "sonner";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in-progress" | "resolved" | "closed";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: string;
  created: string;
  lastUpdated: string;
  responses: number;
  uploadedFile?: File;
}

const Support = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "TICK-001",
      title: "Login Issues with Student Portal",
      description: "Unable to access student portal after password reset",
      priority: "high",
      status: "open",
      category: "Technical",
      created: "2024-01-20",
      lastUpdated: "2024-01-20",
      responses: 0
    },
    {
      id: "TICK-002", 
      title: "Grade Discrepancy in Mathematics",
      description: "There seems to be an error in my final grade calculation",
      priority: "medium",
      status: "in-progress",
      category: "Academic",
      created: "2024-01-18",
      lastUpdated: "2024-01-19",
      responses: 2
    },
    {
      id: "TICK-003",
      title: "Library Access Card Not Working",
      description: "My student ID card is not scanning at the library entrance",
      priority: "low",
      status: "resolved",
      category: "Facilities",
      created: "2024-01-15",
      lastUpdated: "2024-01-17",
      responses: 1
    }
  ]);

  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    category: "",
    uploadedFile: null as File | null
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description || !newTicket.category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const ticket: SupportTicket = {
      id: `TICK-${String(tickets.length + 1).padStart(3, '0')}`,
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      status: "open",
      category: newTicket.category,
      created: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      responses: 0,
      uploadedFile: newTicket.uploadedFile || undefined
    };

    setTickets([ticket, ...tickets]);
    setIsCreateTicketOpen(false);
    setNewTicket({
      title: "",
      description: "",
      priority: "medium",
      category: "",
      uploadedFile: null
    });

    toast.success("Support ticket created successfully!");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewTicket({...newTicket, uploadedFile: file});
      toast.success(`File "${file.name}" uploaded successfully!`);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Support Center</h1>
            <p className="text-gray-500">Get help with your campus services and submit support tickets</p>
          </div>
          
          <Button 
            onClick={() => setIsCreateTicketOpen(true)}
            className="bg-campus-blue hover:bg-campus-hover flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Open Tickets</p>
                  <h3 className="text-2xl font-bold mt-1">{tickets.filter(t => t.status === 'open').length}</h3>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <h3 className="text-2xl font-bold mt-1">{tickets.filter(t => t.status === 'in-progress').length}</h3>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <h3 className="text-2xl font-bold mt-1">{tickets.filter(t => t.status === 'resolved').length}</h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                  <h3 className="text-2xl font-bold mt-1">4h</h3>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search tickets..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <h4 className="font-medium">{ticket.title}</h4>
                      <p className="text-sm text-gray-500">{ticket.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">#{ticket.id}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{ticket.category}</span>
                        {ticket.uploadedFile && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-blue-600">📎 File attached</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                    <div className="text-right text-sm text-gray-500">
                      <div>{ticket.lastUpdated}</div>
                      <div>{ticket.responses} responses</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTickets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tickets found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={newTicket.title}
                onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                placeholder="Brief description of your issue" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket({...newTicket, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical Issues</SelectItem>
                    <SelectItem value="Academic">Academic Support</SelectItem>
                    <SelectItem value="Facilities">Campus Facilities</SelectItem>
                    <SelectItem value="Financial">Financial Services</SelectItem>
                    <SelectItem value="Account">Account Issues</SelectItem>
                    <SelectItem value="Document Verification">Document Verification</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value: Priority) => setNewTicket({...newTicket, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-upload">Attach File (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                {newTicket.uploadedFile && (
                  <span className="text-sm text-gray-600">{newTicket.uploadedFile.name}</span>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder="Provide detailed information about your issue" 
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCreateTicketOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateTicket}
              disabled={!newTicket.title || !newTicket.description || !newTicket.category}
              className="bg-campus-blue hover:bg-campus-hover"
            >
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Support;
