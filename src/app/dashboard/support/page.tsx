"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface SupportTicket {
  id: number;
  userId: number;
  bookingId?: number;
  subject: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/communication?type=tickets");
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "urgent":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === "all") return true;
    return ticket.status === filter;
  });

  const handleCreateTicket = async (formData: FormData) => {
    try {
      const response = await fetch("/api/communication", {
        method: "POST",
        body: JSON.stringify({
          type: "ticket",
          subject: formData.get("subject"),
          description: formData.get("description"),
          category: formData.get("category") || "general",
          priority: formData.get("priority") || "medium",
          bookingId: formData.get("bookingId") ? parseInt(formData.get("bookingId") as string) : undefined,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setShowCreateForm(false);
        fetchTickets(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="support">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Support Tickets...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="support">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Support Tickets</h1>
            <p className="text-[#45a29e]">
              Get help and track your support requests
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 lg:mt-0 px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-medium"
          >
            Create New Ticket
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-white font-medium mr-2">Status:</span>
            {[
              { value: "all", label: "All Tickets", count: tickets.length },
              { value: "open", label: "Open", count: tickets.filter(t => t.status === "open").length },
              { value: "in_progress", label: "In Progress", count: tickets.filter(t => t.status === "in_progress").length },
              { value: "resolved", label: "Resolved", count: tickets.filter(t => t.status === "resolved").length },
              { value: "closed", label: "Closed", count: tickets.filter(t => t.status === "closed").length },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? "bg-[#c5a059] text-[#0b0c10]"
                    : "bg-[#2d3b2d] border border-[#45a29e]/20 text-[#45a29e] hover:border-[#45a29e]/40"
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="mb-6 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Support Ticket</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-[#45a29e] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleCreateTicket(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[#45a29e] text-sm font-medium mb-2">
                  Subject *
                </label>
                <input
                  name="subject"
                  type="text"
                  required
                  className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white placeholder-[#45a29e]/50 focus:border-[#c5a059] focus:outline-none"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-[#45a29e] text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing</option>
                  <option value="service">Service Quality</option>
                  <option value="account">Account</option>
                </select>
              </div>

              <div>
                <label className="block text-[#45a29e] text-sm font-medium mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-[#45a29e] text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white placeholder-[#45a29e]/50 focus:border-[#c5a059] focus:outline-none"
                  placeholder="Detailed description of your issue or request"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-medium"
                >
                  Create Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-[#2d3b2d] border border-[#45a29e]/20 text-[#45a29e] rounded-lg hover:border-[#45a29e]/40 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-12 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-bold text-white mb-2">No support tickets found</h3>
              <p className="text-[#45a29e] mb-6">
                {filter === "all"
                  ? "You haven't created any support tickets yet."
                  : `No ${filter.replace('_', ' ')} tickets found.`
                }
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-block px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{ticket.subject}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-[#45a29e] mb-3">{ticket.description}</p>

                    <div className="flex items-center gap-4 text-sm text-[#45a29e]">
                      <span>Category: {ticket.category}</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>Last Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors text-sm">
                      View Details
                    </button>
                    {ticket.status !== "closed" && (
                      <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm font-medium">
                        Update Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {tickets.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
              <div className="text-3xl font-bold text-white mb-2">{tickets.length}</div>
              <div className="text-[#45a29e] text-sm">Total Tickets</div>
            </div>

            <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {tickets.filter(t => t.status === "open").length}
              </div>
              <div className="text-[#45a29e] text-sm">Open Tickets</div>
            </div>

            <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {tickets.filter(t => t.status === "resolved" || t.status === "closed").length}
              </div>
              <div className="text-[#45a29e] text-sm">Resolved</div>
            </div>

            <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {tickets.filter(t => t.priority === "urgent" || t.priority === "high").length}
              </div>
              <div className="text-[#45a29e] text-sm">High Priority</div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}