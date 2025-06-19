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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Briefcase, Building, MapPin, Calendar, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface JobListing {
  id: string;
  title: string;
  company: string;
  type: 'job' | 'internship';
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  deadline: string;
  status: 'active' | 'closed' | 'draft';
  applicants: number;
}

const Sales = () => {
  const [jobListings, setJobListings] = useState<JobListing[]>([
    {
      id: "J001",
      title: "Software Engineer",
      company: "Tech Solutions Inc.",
      type: "job",
      location: "Bangalore, India",
      salary: "₹8-12 LPA",
      description: "We are looking for a skilled software engineer to join our development team.",
      requirements: ["React.js", "Node.js", "MongoDB", "2+ years experience"],
      postedDate: "2024-01-15",
      deadline: "2024-02-15",
      status: "active",
      applicants: 45
    },
    {
      id: "I001",
      title: "Data Science Intern",
      company: "Analytics Corp",
      type: "internship",
      location: "Mumbai, India",
      salary: "₹15,000/month",
      description: "6-month internship opportunity in data science and machine learning.",
      requirements: ["Python", "Data Analysis", "Machine Learning", "Final year student"],
      postedDate: "2024-01-20",
      deadline: "2024-02-20",
      status: "active",
      applicants: 78
    },
    {
      id: "J002",
      title: "UI/UX Designer",
      company: "Design Studio",
      type: "job",
      location: "Delhi, India",
      salary: "₹6-10 LPA",
      description: "Creative UI/UX designer needed for innovative projects.",
      requirements: ["Figma", "Adobe Creative Suite", "Design Thinking", "3+ years experience"],
      postedDate: "2024-01-10",
      deadline: "2024-01-30",
      status: "closed",
      applicants: 32
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [newListing, setNewListing] = useState({
    title: "",
    company: "",
    type: "job" as 'job' | 'internship',
    location: "",
    salary: "",
    description: "",
    requirements: "",
    deadline: ""
  });

  const handleCreateListing = () => {
    if (!newListing.title || !newListing.company || !newListing.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const listing: JobListing = {
      id: `${newListing.type === 'job' ? 'J' : 'I'}${Date.now().toString().slice(-3)}`,
      title: newListing.title,
      company: newListing.company,
      type: newListing.type,
      location: newListing.location,
      salary: newListing.salary,
      description: newListing.description,
      requirements: newListing.requirements.split(',').map(req => req.trim()),
      postedDate: new Date().toISOString().split('T')[0],
      deadline: newListing.deadline,
      status: "active",
      applicants: 0
    };

    setJobListings([listing, ...jobListings]);
    setIsCreateDialogOpen(false);
    setNewListing({
      title: "",
      company: "",
      type: "job",
      location: "",
      salary: "",
      description: "",
      requirements: "",
      deadline: ""
    });

    toast.success(`${newListing.type === 'job' ? 'Job' : 'Internship'} listing created successfully!`);
  };

  const handleEditListing = () => {
    if (!editingJob) return;

    const updatedListings = jobListings.map(job => 
      job.id === editingJob.id ? editingJob : job
    );
    
    setJobListings(updatedListings);
    setIsEditDialogOpen(false);
    setEditingJob(null);
    toast.success("Listing updated successfully!");
  };

  const handleDeleteListing = (id: string) => {
    setJobListings(jobListings.filter(job => job.id !== id));
    toast.success("Listing deleted successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'job' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Sales & Job Management</h1>
            <p className="text-gray-500">Manage job postings and internship opportunities</p>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-campus-blue hover:bg-campus-hover flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Listing
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                  <h3 className="text-2xl font-bold mt-1">{jobListings.filter(j => j.type === 'job').length}</h3>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Internships</p>
                  <h3 className="text-2xl font-bold mt-1">{jobListings.filter(j => j.type === 'internship').length}</h3>
                </div>
                <Building className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Listings</p>
                  <h3 className="text-2xl font-bold mt-1">{jobListings.filter(j => j.status === 'active').length}</h3>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                  <h3 className="text-2xl font-bold mt-1">{jobListings.reduce((sum, job) => sum + job.applicants, 0)}</h3>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="all">All Listings</TabsTrigger>
            <TabsTrigger value="job">Jobs</TabsTrigger>
            <TabsTrigger value="internship">Internships</TabsTrigger>
            <TabsTrigger value="active">Active Only</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {jobListings.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="font-medium text-green-600">{job.salary}</span>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index}  className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Posted: {job.postedDate}</span>
                          <span>Deadline: {job.deadline}</span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          onClick={() => {
                            setEditingJob(job);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button  
                          onClick={() => handleDeleteListing(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="job">
            <div className="grid gap-4">
              {jobListings.filter(job => job.type === 'job').map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="font-medium text-green-600">{job.salary}</span>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Posted: {job.postedDate}</span>
                          <span>Deadline: {job.deadline}</span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          onClick={() => {
                            setEditingJob(job);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteListing(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="internship">
            <div className="grid gap-4">
              {jobListings.filter(job => job.type === 'internship').map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="font-medium text-green-600">{job.salary}</span>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Posted: {job.postedDate}</span>
                          <span>Deadline: {job.deadline}</span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          onClick={() => {
                            setEditingJob(job);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteListing(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="grid gap-4">
              {jobListings.filter(job => job.status === 'active').map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="font-medium text-green-600">{job.salary}</span>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Posted: {job.postedDate}</span>
                          <span>Deadline: {job.deadline}</span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          onClick={() => {
                            setEditingJob(job);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteListing(job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Listing Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Job/Internship Listing</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input 
                  id="title" 
                  value={newListing.title}
                  onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                  placeholder="e.g. Software Engineer" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newListing.type}
                  onValueChange={(value) => setNewListing({...newListing, type: value as 'job' | 'internship'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company *</Label>
                <Input 
                  id="company" 
                  value={newListing.company}
                  onChange={(e) => setNewListing({...newListing, company: e.target.value})}
                  placeholder="Company name" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={newListing.location}
                  onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                  placeholder="e.g. Bangalore, India" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salary">Salary/Stipend</Label>
                <Input 
                  id="salary" 
                  value={newListing.salary}
                  onChange={(e) => setNewListing({...newListing, salary: e.target.value})}
                  placeholder="e.g. ₹8-12 LPA or ₹15,000/month" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input 
                  id="deadline" 
                  type="date"
                  value={newListing.deadline}
                  onChange={(e) => setNewListing({...newListing, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea 
                id="description" 
                value={newListing.description}
                onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                placeholder="Describe the role, responsibilities, and company" 
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requirements">Requirements (comma-separated)</Label>
              <Textarea 
                id="requirements" 
                value={newListing.requirements}
                onChange={(e) => setNewListing({...newListing, requirements: e.target.value})}
                placeholder="e.g. React.js, Node.js, MongoDB, 2+ years experience" 
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateListing}
              disabled={!newListing.title || !newListing.company || !newListing.description}
              className="bg-campus-blue hover:bg-campus-hover"
            >
              Create Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Listing Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Job Title</Label>
                  <Input 
                    id="edit-title" 
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingJob.status}
                    onValueChange={(value) => setEditingJob({...editingJob, status: value as 'active' | 'closed' | 'draft'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleEditListing}
              className="bg-campus-blue hover:bg-campus-hover"
            >
              Update Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Sales;
