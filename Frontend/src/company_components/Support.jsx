import { useState, useEffect, useRef } from 'react';
import { FaChevronRight, FaTicketAlt, FaChartLine, FaPaperPlane, FaUserGraduate, FaRobot, FaTimes, FaCheck } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import axios from 'axios';
axios.defaults.withCredentials = true;
import CompanySettingsModal from './CompanySettingsModal';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Support = () => {
  const [messages, setMessages] = useState([{message: 'Type your query here', sender: 'Support Bot', senderType: 'support_bot', timestamp: new Date().toISOString()}]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showTicketList, setShowTicketList] = useState(false);
  const [quickHelpTopics, setQuickHelpTopics] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
      axios.get(`${apiUrl}/api/company/${companyId}`)
        .then(res => {
          setCompany(res.data);
        })
        .catch(err => {
          setError('Error loading company information');
        });
      
      fetchTickets(companyId);
      fetchQuickHelpTopics();
    }
  }, []);

  const fetchTickets = async (userId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/support/tickets/${userId}`);
      setTickets(response.data.tickets || []);
    } catch (error) {
      // Error handling without console logging
    }
  };

  const fetchQuickHelpTopics = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/support/quick-help/company`);
      setQuickHelpTopics(response.data.topics || []);
    } catch (error) {
      // Error handling without console logging
    }
  };

  const handleQuickHelpClick = (topic) => {
    setNewMessage(topic.title);
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !company?._id) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      const userMessage = {
        message: newMessage,
        sender: company.name,
        senderType: 'user',
        timestamp: new Date().toISOString()
      };
      
      // First, add user's message to the UI
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Show bot typing indicator
      setIsBotTyping(true);
      
      if (!currentTicket) {
        // Create new ticket
        response = await axios.post(`${apiUrl}/api/support/tickets`, {
          userId: company._id,
          userType: 'company',
          subject: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
          message: newMessage
        });
        
        setCurrentTicket(response.data.ticket);
        // Add bot's response after a delay
        setTimeout(() => {
          setIsBotTyping(false);
          setMessages(prev => [...prev, {
            message: response.data.ticket.messages[1].message,
            sender: 'Support Bot',
            senderType: 'support_bot',
            timestamp: new Date().toISOString()
          }]);
        }, 2000);
        
        setTickets(prev => [response.data.ticket, ...prev]);
      } else {
        // Add message to existing ticket
        response = await axios.post(`${apiUrl}/api/support/tickets/${company._id}/${currentTicket.ticketId}/messages`, {
          message: newMessage,
          userType: 'company'
        });
        
        setCurrentTicket(response.data.ticket);
        // Add bot's response after a delay
        setTimeout(() => {
          setIsBotTyping(false);
          setMessages(prev => [...prev, {
            message: response.data.ticket.messages[response.data.ticket.messages.length - 1].message,
            sender: 'Support Bot',
            senderType: 'support_bot',
            timestamp: new Date().toISOString()
          }]);
        }, 2000);
      }
      
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setIsBotTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = async (ticket) => {
    try {
      const response = await axios.get(`${apiUrl}/api/support/tickets/${company._id}/${ticket.ticketId}`);
      setCurrentTicket(response.data.ticket);
      setMessages(response.data.ticket.messages || []);
      setShowTicketList(false);
    } catch (error) {
      setError('Failed to load ticket');
    }
  };

  const handleNewConversation = () => {
    setCurrentTicket(null);
    setMessages([]);
    setNewMessage('');
    setError(null);
  };

  const handleCloseTicket = async () => {
    if (!currentTicket || !company?._id) return;
    
    try {
      await axios.patch(`${apiUrl}/api/support/tickets/${company._id}/${currentTicket.ticketId}/status`, {
        status: 'closed'
      });
      
      setTickets(prev => prev.map(ticket => 
        ticket.ticketId === currentTicket.ticketId 
          ? { ...ticket, status: 'closed' }
          : ticket
      ));
      
      handleNewConversation();
    } catch (error) {
      // Error handling without console logging
    }
  };

  // Navigation items with company ID
  const navItems = [
    { label: 'Dashboard', href: `/company/${localStorage.getItem('companyId')}/dashboard`, icon: <FaChevronRight /> },
    { label: 'Demand Roles', href: `/company/${localStorage.getItem('companyId')}/post-job`, icon: <FaChevronRight /> },
    { label: 'Scheduled Interviews', href: `/company/${localStorage.getItem('companyId')}/scheduled-interviews`, icon: <FaChevronRight /> },
    { label: 'Applications', href: `/company/${localStorage.getItem('companyId')}/applications`, icon: <FaChevronRight /> },
    { label: 'Manage Employees', href: `/company/${localStorage.getItem('companyId')}/employees`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/company/${localStorage.getItem('companyId')}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/company/${localStorage.getItem('companyId')}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const sidebarUser = {
    name: company?.name || 'Company Admin',
    role: 'Company Admin',
    initials: company?.name ? company.name.substring(0, 2).toUpperCase() : 'CA'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COMPANY SERVICES" />
      <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: 0, position: 'relative' }}>
        <div style={{ padding: '0 24px' }}>
          <SearchBar onSettingsClick={() => setShowSettings(true)} />
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#1f2937' }}>Support Center</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowTicketList(!showTicketList)}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                {showTicketList ? 'Hide Tickets' : 'View Tickets'}
              </button>
              {currentTicket && (
                <button
                  onClick={handleNewConversation}
                  style={{
                    padding: '8px 16px',
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#5855eb'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#6366f1'}
                >
                  New Conversation
                </button>
              )}
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: showTicketList ? '300px 1fr 300px' : '1fr 300px', 
            gap: '24px',
            height: 'calc(100vh - 200px)'
          }}>
            {/* Ticket List */}
            {showTicketList && (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                overflowY: 'auto',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Previous Tickets</h3>
                {tickets.length === 0 ? (
                  <div style={{ color: '#6b7280', textAlign: 'center' }}>No tickets yet</div>
                ) : (
                  tickets.map(ticket => (
                    <div
                      key={ticket.ticketId}
                      onClick={() => handleTicketClick(ticket)}
                      style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        background: currentTicket?.ticketId === ticket.ticketId ? '#f3f4f6' : '#fff',
                        transition: 'all 0.2s ease',
                        boxShadow: currentTicket?.ticketId === ticket.ticketId ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (currentTicket?.ticketId !== ticket.ticketId) {
                          e.currentTarget.style.background = '#f9fafb';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (currentTicket?.ticketId !== ticket.ticketId) {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>
                        {ticket.subject}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
                        {formatDate(ticket.createdAt)}
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        background: getStatusColor(ticket.status) + '20',
                        color: getStatusColor(ticket.status)
                      }}>
                        {ticket.status.replace('_', ' ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Messages Section */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e5e7eb',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {currentTicket && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f3f4f6'
                }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.1rem' }}>Ticket: {currentTicket.ticketId}</h3>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Status: <span style={{ color: getStatusColor(currentTicket.status), fontWeight: 500 }}>
                        {currentTicket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseTicket}
                    style={{
                      padding: '8px 16px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#fecaca';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Close Ticket
                  </button>
                </div>
              )}

              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                marginBottom: '24px',
                padding: '8px',
                background: '#fafafa',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                {messages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#6b7280',
                    padding: '48px 0',
                    fontSize: '1.1rem'
                  }}>
                    {currentTicket ? 'No messages in this ticket' : 'Start a conversation with our support bot!'}
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.senderType === 'user' ? 'flex-end' : 'flex-start',
                          animation: 'slideInUp 0.3s ease-out',
                          animationFillMode: 'both',
                          animationDelay: `${index * 0.1}s`
                        }}
                      >
                        <div style={{
                          background: message.senderType === 'user' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          color: '#fff',
                          padding: '16px 20px',
                          borderRadius: message.senderType === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          maxWidth: '75%',
                          position: 'relative',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                        >
                          <div style={{ 
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 500
                          }}>
                            {message.senderType === 'support_bot' && <FaRobot style={{ color: '#ffd700' }} />}
                            {message.sender}
                          </div>
                          <div style={{ 
                            whiteSpace: 'pre-line',
                            lineHeight: '1.6',
                            fontSize: '0.95rem'
                          }}>
                            {message.message}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: '8px',
                            textAlign: 'right'
                          }}>
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isBotTyping && (
                      <div style={{
                        marginBottom: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        animation: 'slideInUp 0.3s ease-out'
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          color: '#fff',
                          padding: '16px 20px',
                          borderRadius: '18px 18px 18px 4px',
                          maxWidth: '75%',
                          position: 'relative',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)'
                        }}>
                          <div style={{ 
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 500
                          }}>
                            <FaRobot style={{ color: '#ffd700' }} />
                            Support Bot
                          </div>
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              background: '#fff',
                              borderRadius: '50%',
                              animation: 'bounce 1s infinite'
                            }} />
                            <div style={{
                              width: '8px',
                              height: '8px',
                              background: '#fff',
                              borderRadius: '50%',
                              animation: 'bounce 1s infinite 0.2s'
                            }} />
                            <div style={{
                              width: '8px',
                              height: '8px',
                              background: '#fff',
                              borderRadius: '50%',
                              animation: 'bounce 1s infinite 0.4s'
                            }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  color: '#fff',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  animation: 'shake 0.5s ease-in-out'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitMessage} style={{
                display: 'flex',
                gap: '12px',
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    background: '#fff',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  style={{
                    padding: '14px 24px',
                    background: loading || !newMessage.trim() 
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: loading || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    boxShadow: loading || !newMessage.trim() ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseOver={(e) => {
                    if (!loading && newMessage.trim()) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading && newMessage.trim()) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Help Section */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              overflowY: 'auto',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                marginBottom: '20px',
                color: '#1f2937',
                fontSize: '1.2rem',
                fontWeight: 600
              }}>
                Quick Help
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quickHelpTopics.map((topic, index) => (
                  <div
                    key={index}
                    onClick={() => handleQuickHelpClick(topic)}
                    style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid #e2e8f0',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: 500, 
                      color: '#374151',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {topic.title}
                    </div>
                  </div>
                ))}
                
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  border: '2px solid #f59e0b',
                  marginTop: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#92400e' }}>
                    Need more help?
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
                    Contact our support team at support@campusadmin.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <CompanySettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          company={company}
          onUpdate={(updatedCompany) => {
            setCompany(updatedCompany);
            setSidebarUser({
              initials: updatedCompany.name.substring(0, 2).toUpperCase(),
              name: updatedCompany.name,
              role: 'Company Admin'
            });
          }}
        />
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default Support; 