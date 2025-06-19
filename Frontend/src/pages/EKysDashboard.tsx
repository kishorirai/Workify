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
import { CheckCircle, XCircle, AlertCircle, Upload, Shield, FileText, Plus, Download, Eye } from "lucide-react";
import { toast } from "sonner";

// Digi API Configuration
// Replace these with your actual API credentials for production
const DIGI_API_CONFIG = {
  BASE_URL: 'https://ext.digio.in:444', // Will change to https://api.digio.in for production
  CLIENT_ID: 'YOUR_CLIENT_ID_HERE',
  CLIENT_SECRET: 'YOUR_CLIENT_SECRET_HERE'
};

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'verified' | 'pending' | 'missing' | 'rejected';
  lastUpdated: string;
  source: 'digi-kyc' | 'manual';
  kycId?: string;
  downloadUrl?: string;
}

interface VerificationTicket {
  id: string;
  studentName: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedFile?: File;
  created: string;
  description: string;
}

interface DigiKycRequest {
  identifier: string; // email or mobile
  template_name?: string;
}

const EKysDashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Aadhaar Card",
      type: "Identity Proof",
      status: "verified",
      lastUpdated: "2024-01-15",
      source: "digi-kyc"
    },
    {
      id: "2", 
      name: "10th Marksheet",
      type: "Educational Certificate",
      status: "verified",
      lastUpdated: "2024-01-10",
      source: "digi-kyc"
    },
    {
      id: "3",
      name: "12th Marksheet", 
      type: "Educational Certificate",
      status: "missing",
      lastUpdated: "N/A",
      source: "digi-kyc"
    },
    {
      id: "4",
      name: "Degree Certificate",
      type: "Educational Certificate", 
      status: "pending",
      lastUpdated: "2024-01-20",
      source: "manual"
    }
  ]);

  const [tickets, setTickets] = useState<VerificationTicket[]>([]);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    documentType: "",
    description: "",
    uploadedFile: null as File | null
  });
  const [kycData, setKycData] = useState({
    identifier: "",
    templateName: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Digi KYC API Integration
  const initiateDigiKyc = async () => {
    if (!kycData.identifier) {
      toast.error("Please provide email or mobile number.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${DIGI_API_CONFIG.BASE_URL}/client/kyc/v2/request/with_template`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${DIGI_API_CONFIG.CLIENT_ID}:${DIGI_API_CONFIG.CLIENT_SECRET}`)}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: kycData.identifier,
          template_name: kycData.templateName || "default"
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("KYC Response:", data);
        
        // Add new document with KYC ID
        const newDoc: Document = {
          id: `kyc-${Date.now()}`,
          name: "KYC Verification",
          type: "Identity Verification",
          status: "pending",
          lastUpdated: new Date().toISOString().split('T')[0],
          source: "digi-kyc",
          kycId: data.kyc_id || data.id
        };
        
        setDocuments([newDoc, ...documents]);
        setIsKycDialogOpen(false);
        setKycData({ identifier: "", templateName: "" });
        toast.success("KYC verification initiated successfully!");
      } else {
        const errorData = await response.json();
        console.error("KYC Error:", errorData);
        toast.error(`KYC initiation failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("KYC API Error:", error);
      toast.error("Error initiating KYC verification. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check KYC Status
  const checkKycStatus = async (kycId: string) => {
    try {
      const response = await fetch(`${DIGI_API_CONFIG.BASE_URL}/client/kyc/v2/${kycId}/response`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${DIGI_API_CONFIG.CLIENT_ID}:${DIGI_API_CONFIG.CLIENT_SECRET}`)}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("KYC Status:", data);
        
        // Update document status based on response
        setDocuments(docs => docs.map(doc => 
          doc.kycId === kycId 
            ? { ...doc, status: data.status === 'completed' ? 'verified' : 'pending' }
            : doc
        ));
        
        toast.success("KYC status updated!");
      }
    } catch (error) {
      console.error("Error checking KYC status:", error);
      toast.error("Error checking KYC status.");
    }
  };

  // Download Document
  const downloadDocument = async (downloadUrl: string, fileName: string) => {
    try {
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Basic ${btoa(`${DIGI_API_CONFIG.CLIENT_ID}:${DIGI_API_CONFIG.CLIENT_SECRET}`)}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Document downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Error downloading document.");
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.documentType || !newTicket.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const ticket: VerificationTicket = {
      id: `VT${Date.now()}`,
      studentName: "Alex Johnson",
      documentType: newTicket.documentType,
      status: "pending",
      uploadedFile: newTicket.uploadedFile ?? undefined,
      created: new Date().toISOString().split('T')[0],
      description: newTicket.description
    };

    setTickets([ticket, ...tickets]);
    setIsCreateTicketOpen(false);
    setNewTicket({
      documentType: "",
      description: "",
      uploadedFile: null
    });

    toast.success("Verification ticket created successfully!");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewTicket({...newTicket, uploadedFile: file});
      toast.success(`File "${file.name}" uploaded successfully!`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">KYC Dashboard</h1>
            <p className="text-gray-500">Manage and verify your documents through DigiLocker</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsKycDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Start KYC
            </Button>
            <Button 
              onClick={() => setIsCreateTicketOpen(true)}
              className="bg-campus-blue hover:bg-campus-hover flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Verification Ticket
            </Button>
          </div>
        </div>

        {/* Document Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Verified Documents</p>
                  <h3 className="text-2xl font-bold mt-1">{documents.filter(d => d.status === 'verified').length}</h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Verification</p>
                  <h3 className="text-2xl font-bold mt-1">{documents.filter(d => d.status === 'pending').length}</h3>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Missing Documents</p>
                  <h3 className="text-2xl font-bold mt-1">{documents.filter(d => d.status === 'missing').length}</h3>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Open Tickets</p>
                  <h3 className="text-2xl font-bold mt-1">{tickets.filter(t => t.status === 'pending').length}</h3>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Document Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-sm text-gray-500">{doc.type}</p>
                      {doc.kycId && <p className="text-xs text-blue-600">KYC ID: {doc.kycId}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {doc.source === 'digi-kyc' ? 'Digi KYC' : 'Manual Upload'}
                    </span>
                    <div className="flex gap-2">
                      {doc.kycId && (
                        <Button
                          onClick={() => checkKycStatus(doc.kycId!)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {doc.downloadUrl && (
                        <Button
                          onClick={() => downloadDocument(doc.downloadUrl!, doc.name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{doc.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification Tickets */}
        {tickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Ticket #{ticket.id}</h4>
                      <p className="text-sm text-gray-500">{ticket.documentType}</p>
                      <p className="text-xs text-gray-400">{ticket.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{ticket.created}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Digi KYC Dialog */}
      <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Initiate Digi KYC Verification</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier">Email or Mobile Number</Label>
              <Input 
                id="identifier" 
                value={kycData.identifier}
                onChange={(e) => setKycData({...kycData, identifier: e.target.value})}
                placeholder="Enter email or mobile number" 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="template">Template Name (Optional)</Label>
              <Input 
                id="template" 
                value={kycData.templateName}
                onChange={(e) => setKycData({...kycData, templateName: e.target.value})}
                placeholder="Enter template name or leave empty for default" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsKycDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={initiateDigiKyc}
              disabled={!kycData.identifier || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Start KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Verification Ticket Dialog */}
      <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Document Verification Ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select
                value={newTicket.documentType}
                onValueChange={(value) => setNewTicket({...newTicket, documentType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                  <SelectItem value="PAN Card">PAN Card</SelectItem>
                  <SelectItem value="10th Marksheet">10th Marksheet</SelectItem>
                  <SelectItem value="12th Marksheet">12th Marksheet</SelectItem>
                  <SelectItem value="Degree Certificate">Degree Certificate</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file-upload">Upload Document (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
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
                placeholder="Describe your verification request or any issues you're facing" 
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCreateTicketOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateTicket}
              disabled={!newTicket.documentType || !newTicket.description}
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

export default EKysDashboard;
